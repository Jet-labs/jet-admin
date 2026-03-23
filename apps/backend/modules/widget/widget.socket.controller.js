/**
 * Widget Socket Controller
 * 
 * Handles WebSocket events for widget-workflow integration:
 * - Connect widgets to workflows
 * - Stream context updates
 * - Handle interactive inputs
 * - Manage disconnections
 */
const Logger = require('../../utils/logger');
const { widgetWorkflowBridge } = require('./widgetWorkflowBridge');
const { workflowService } = require('../workflow/workflow.service');
const { stateManager } = require('../workflow/orchestrator/stateManager');
const orchestrator = require('../workflow/orchestrator/orchestrator');

/**
 * Widget Socket Controller
 */

/**
 * Strip internal orchestrator keys (prefixed with __) from context
 * before sending to the frontend.
 */
function _stripInternalKeys(context) {
  if (!context) return {};
  return Object.fromEntries(
    Object.entries(context).filter(([key]) => !key.startsWith('__'))
  );
}

const widgetSocketController = {

  /**
   * Handle widget connecting to a workflow
   * Modes:
   * - 'execute': Start a new workflow execution
   * - 'subscribe': Subscribe to an existing instance
   * - 'replay': Get final context of completed instance
   * 
   * @param {object} params
   * @param {object} params.socket - Socket.IO socket
   * @param {string} params.widgetID - Widget ID
   * @param {string} params.workflowID - Workflow ID
   * @param {string} params.mode - Connection mode
   * @param {object} params.inputArgs - Input parameters for execute mode
   * @param {string} params.instanceID - Instance ID for subscribe/replay mode
   * @param {string} params.tenantID - Tenant ID
   * @param {string} params.firebaseID - User's Firebase ID
   * @param {string} params.widgetType - Widget type identifier
   * @param {object} params.widgetConfig - Opaque widget configuration blob
   * @param {object} params.workflowConfig - Workflow binding configuration
   */
  async onWidgetWorkflowConnect({ 
    socket, 
    widgetID, 
    workflowID, 
    mode = 'execute', 
    inputArgs = {}, 
    instanceID = null,
    tenantID,
    firebaseID,
    // Generic widget configuration (opaque — only widgets-logic knows internals)
    widgetType,
    widgetConfig,
    workflowConfig,
  }) {
    Logger.log('info', {
      message: 'widgetSocketController:onWidgetWorkflowConnect',
      params: { widgetID, workflowID, mode, tenantID, widgetType, hasWidgetConfig: !!widgetConfig, hasWorkflowConfig: !!workflowConfig },
    });

    try {
      let responseInstanceID = instanceID;
      let initialContext = null;
      let workflowMeta = null;

      switch (mode) {
        case 'execute': {
          // Start a new workflow execution
          if (!workflowID) {
            throw new Error('workflowID is required for execute mode');
          }

          const result = await orchestrator.startWorkflow({
            workflowID,
            tenantID,
            inputArgs,
          });

          responseInstanceID = result.instanceID;
          initialContext = { input: inputArgs };
          
          // IMPORTANT: Register widget IMMEDIATELY after getting instanceID
          // This must happen before any node jobs complete and emit context updates
          widgetWorkflowBridge.registerWidget(widgetID, responseInstanceID, socket, {
            workflowID,
            mode,
            tenantID,
            firebaseID,
            widgetType,
            widgetConfig,
            workflowConfig,
          });
          
          Logger.log('info', {
            message: 'widgetSocketController:workflowStarted',
            params: { widgetID, instanceID: responseInstanceID },
          });
          
          // Send connection confirmation immediately
          socket.emit('widget_workflow_connected', {
            widgetID,
            instanceID: responseInstanceID,
            workflowID,
            mode,
            initialContext,
            workflowMeta,
          });
          
          // Return early - registration already done
          return;
        }

        case 'subscribe': {
          // Subscribe to an existing workflow instance
          if (!instanceID) {
            throw new Error('instanceID is required for subscribe mode');
          }

          const instance = await stateManager.getInstance(instanceID);
          if (!instance) {
            throw new Error(`Instance ${instanceID} not found`);
          }

          responseInstanceID = instanceID;
          // Assemble context from log entries and strip internal keys
          const assembledCtx = await stateManager.assembleContext(instanceID);
          initialContext = _stripInternalKeys(assembledCtx);
          workflowMeta = { status: instance.status };
          
          Logger.log('info', {
            message: 'widgetSocketController:subscribedToInstance',
            params: { widgetID, instanceID },
          });
          break;
        }

        case 'replay': {
          // Get final context of completed instance (no live updates)
          if (!instanceID) {
            throw new Error('instanceID is required for replay mode');
          }

          const replayInstance = await stateManager.getInstance(instanceID);
          if (!replayInstance) {
            throw new Error(`Instance ${instanceID} not found`);
          }

          responseInstanceID = instanceID;
          // Assemble context from log entries and strip internal keys
          const replayCtx = await stateManager.assembleContext(instanceID);
          initialContext = _stripInternalKeys(replayCtx);
          
          // Process initial context for widget if config provided
          let processedData = null;
          if (widgetType && widgetConfig) {
            processedData = widgetWorkflowBridge.processContextForWidget(initialContext, {
              widgetType,
              widgetConfig,
              workflowConfig,
            });
          }
          
          // Emit immediately and don't register for live updates
          socket.emit('widget_workflow_connected', {
            widgetID,
            instanceID: responseInstanceID,
            workflowID: replayInstance.workflowID,
            mode: 'replay',
            initialContext,
            processedData,
            workflowStatus: replayInstance.status,
          });
          
          Logger.log('info', {
            message: 'widgetSocketController:replayMode',
            params: { widgetID, instanceID, status: replayInstance.status },
          });
          return; // Don't register for live updates
        }

        default:
          throw new Error(`Unknown mode: ${mode}`);
      }

      // Register widget for live updates with generic configuration
      widgetWorkflowBridge.registerWidget(widgetID, responseInstanceID, socket, {
        workflowID,
        mode,
        tenantID,
        firebaseID,
        widgetType,
        widgetConfig,
        workflowConfig,
      });

      // Send connection confirmation
      socket.emit('widget_workflow_connected', {
        widgetID,
        instanceID: responseInstanceID,
        workflowID,
        mode,
        initialContext,
        workflowMeta,
      });

      Logger.log('success', {
        message: 'widgetSocketController:widgetConnected',
        params: { widgetID, instanceID: responseInstanceID, mode },
      });

    } catch (error) {
      Logger.log('error', {
        message: 'widgetSocketController:onWidgetWorkflowConnect:error',
        params: { widgetID, error: error.message },
      });

      socket.emit('widget_workflow_error', {
        widgetID,
        error: {
          code: 'CONNECTION_FAILED',
          message: error.message,
          recoverable: false,
        },
      });
    }
  },

  /**
   * Handle widget sending interactive input to workflow
   * This allows widgets to drive workflow behavior
   * 
   * @param {object} params
   * @param {object} params.socket - Socket.IO socket
   * @param {string} params.widgetID - Widget ID
   * @param {string} params.instanceID - Instance ID (optional, looked up if not provided)
   * @param {string} params.inputType - Type of input (form_submit, filter_change, action, etc.)
   * @param {object} params.data - Input data
   */
  async onWidgetSendInput({ socket, widgetID, instanceID, inputType, data }) {
    Logger.log('info', {
      message: 'widgetSocketController:onWidgetSendInput',
      params: { widgetID, instanceID, inputType },
    });

    try {
      // Get instance ID from bridge if not provided
      const targetInstanceID = instanceID || widgetWorkflowBridge.getInstanceForWidget(widgetID);
      if (!targetInstanceID) {
        throw new Error('Widget is not connected to any workflow instance');
      }

      // Get current instance
      const instance = await stateManager.getInstance(targetInstanceID);
      if (!instance) {
        throw new Error(`Instance ${targetInstanceID} not found`);
      }

      // Store widget input in context for workflow to access
      const widgetInputUpdate = {
        __widgetInput: {
          widgetID,
          inputType,
          data,
          timestamp: new Date().toISOString(),
        },
      };

      await stateManager.updateContext(
        targetInstanceID,
        widgetInputUpdate,
        instance.version
      );

      // Acknowledge input received
      socket.emit('widget_input_received', {
        widgetID,
        instanceID: targetInstanceID,
        inputType,
        success: true,
      });

      Logger.log('success', {
        message: 'widgetSocketController:inputReceived',
        params: { widgetID, instanceID: targetInstanceID, inputType },
      });

    } catch (error) {
      Logger.log('error', {
        message: 'widgetSocketController:onWidgetSendInput:error',
        params: { widgetID, error: error.message },
      });

      socket.emit('widget_workflow_error', {
        widgetID,
        error: {
          code: 'INPUT_FAILED',
          message: error.message,
        },
      });
    }
  },

  /**
   * Handle widget refresh request (re-execute workflow)
   * 
   * @param {object} params
   * @param {object} params.socket - Socket.IO socket
   * @param {string} params.widgetID - Widget ID
   * @param {object} params.inputArgs - New input parameters (optional)
   * @param {string} params.tenantID - Tenant ID
   */
  async onWidgetRefresh({ socket, widgetID, inputArgs, tenantID }) {
    Logger.log('info', {
      message: 'widgetSocketController:onWidgetRefresh',
      params: { widgetID },
    });

    try {
      const connection = widgetWorkflowBridge.getWidgetConnection(widgetID);
      if (!connection) {
        throw new Error('Widget is not connected');
      }

      // Unregister from old instance
      widgetWorkflowBridge.unregisterWidget(widgetID, socket);

      // Re-execute with same workflow, new inputs
      await this.onWidgetWorkflowConnect({
        socket,
        widgetID,
        workflowID: connection.workflowID,
        mode: 'execute',
        inputArgs: inputArgs || {},
        tenantID: tenantID || connection.tenantID,
      });

      Logger.log('success', {
        message: 'widgetSocketController:refreshed',
        params: { widgetID },
      });

    } catch (error) {
      Logger.log('error', {
        message: 'widgetSocketController:onWidgetRefresh:error',
        params: { widgetID, error: error.message },
      });

      socket.emit('widget_workflow_error', {
        widgetID,
        error: {
          code: 'REFRESH_FAILED',
          message: error.message,
        },
      });
    }
  },

  /**
   * Handle widget disconnect
   * 
   * @param {object} params
   * @param {object} params.socket - Socket.IO socket
   * @param {string} params.widgetID - Widget ID
   */
  async onWidgetWorkflowDisconnect({ socket, widgetID }) {
    Logger.log('info', {
      message: 'widgetSocketController:onWidgetWorkflowDisconnect',
      params: { widgetID },
    });

    widgetWorkflowBridge.unregisterWidget(widgetID, socket);

    socket.emit('widget_workflow_disconnected', {
      widgetID,
      success: true,
    });

    Logger.log('success', {
      message: 'widgetSocketController:widgetDisconnected',
      params: { widgetID },
    });
  },

  /**
   * Handle socket disconnect (cleanup all widget connections for this socket)
   * 
   * @param {object} params
   * @param {object} params.socket - Socket.IO socket
   * @param {string} params.firebaseID - User's Firebase ID
   */
  async onSocketDisconnect({ socket, firebaseID }) {
    Logger.log('info', {
      message: 'widgetSocketController:onSocketDisconnect',
      params: { socketId: socket.id, firebaseID },
    });

    // Clean up all widget connections for this socket
    const stats = widgetWorkflowBridge.getStats();
    for (const conn of stats.connections) {
      const connection = widgetWorkflowBridge.getWidgetConnection(conn.widgetID);
      if (connection && connection.socketId === socket.id) {
        widgetWorkflowBridge.unregisterWidget(conn.widgetID, socket);
      }
    }
  },

  /**
   * Get workflow context schema for a widget
   * Returns the available variables and their types
   * 
   * @param {object} params
   * @param {string} params.workflowID - Workflow ID
   * @param {string} params.tenantID - Tenant ID
   * @returns {object} Schema of available workflow variables
   */
  async getWorkflowContextSchema({ workflowID, tenantID }) {
    Logger.log('info', {
      message: 'widgetSocketController:getWorkflowContextSchema',
      params: { workflowID, tenantID },
    });

    try {
      const workflow = await workflowService.getWorkflowByID({ workflowID, tenantID });
      if (!workflow) {
        throw new Error(`Workflow ${workflowID} not found`);
      }

      // Build schema from workflow nodes
      const schema = {
        inputs: workflow.workflowOptions?.args || [],
        outputs: {},
      };

      // Extract output variables from each node
      for (const node of workflow.tblWorkflowNodes || []) {
        const outputVariable = node.nodeConfig?.outputVariable;
        if (outputVariable) {
          schema.outputs[outputVariable] = {
            nodeID: node.nodeID,
            nodeType: node.nodeType,
            nodeTitle: node.nodeConfig?.title || node.nodeType,
          };
        }
      }

      return schema;

    } catch (error) {
      Logger.log('error', {
        message: 'widgetSocketController:getWorkflowContextSchema:error',
        params: { workflowID, error: error.message },
      });
      throw error;
    }
  },
};

module.exports = { widgetSocketController };
