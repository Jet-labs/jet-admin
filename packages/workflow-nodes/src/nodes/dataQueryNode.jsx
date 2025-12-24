import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowNodes } from '../context';
import { useFormik } from 'formik';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { SiQuantconnect } from 'react-icons/si';
import { VscJson } from 'react-icons/vsc';
import { FaTimes } from 'react-icons/fa';
import { MdOutlineDeleteOutline } from 'react-icons/md';


export const DataQueryNodeConfigurator =  ({ data, onChange }) => {
  console.log('data', data);
  const { dataQueries, strings } = useWorkflowNodes();
  const configurationForm = useFormik({
    initialValues: {
      dataQueryID: data.dataQueryID,
      title: data.title,
      args: data.args,
    },
    onSubmit: (values) => {
      onChange(values);
    },
  });

  useEffect(() => {
    if (data) {
      console.log('data', data.title);
      configurationForm.setFieldValue('title', data.title? data.title : '');
      configurationForm.setFieldValue('dataQueryID', data.dataQueryID);
      configurationForm.setFieldValue('args', data.args);
      
    }
  }, [data]);

  const _handleUpdateDatasetQueryArgs = useCallback((arg, value) => {
    configurationForm.setFieldValue(`args.${arg}`, value);
  }, [configurationForm]);


  const selectedQuery = useMemo(() => {
    return dataQueries
      ? dataQueries.find(
        (q) =>
          q.dataQueryID ==
          configurationForm.values.dataQueryID
      )
      : null;
  }, [dataQueries, configurationForm.values.dataQueryID]);

  return (
    <div className="w-full h-full">
      <form
        onSubmit={configurationForm.handleSubmit}
        className="space-y-3"
      >
        <div className="flex flex-col justify-start items-stretch h-full">
          <label className="block mb-1 text-xs font-medium text-slate-500">
            {strings.WORKFLOW_EDITOR_DATA_QUERY_TITLE_LABEL}
          </label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder={strings.WORKFLOW_EDITOR_DATA_QUERY_TITLE_PLACEHOLDER}
            className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full px-2.5 py-1.5"
            value={configurationForm.values.title}
            onChange={configurationForm.handleChange}
          />
        </div>
        <div className="flex flex-col justify-start items-stretch h-full">
          <label className="block mb-1 text-xs font-medium text-slate-500">
            {strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_LABEL}
          </label>
          <select
            name="dataQueryID"
            id="dataQueryID"
            value={configurationForm.values.dataQueryID}
            onChange={configurationForm.handleChange}
            onBlur={configurationForm.handleBlur}
            className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full px-2.5 py-1.5"
          >
            <option value="" disabled selected>
              {strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_SELECT_LABEL}
            </option>
            {dataQueries?.map((query) => (
              <option key={query.dataQueryID} value={query.dataQueryID}>
                {query.dataQueryTitle}
              </option>
            ))}
          </select>
        </div>
        {selectedQuery?.dataQueryOptions?.args?.length > 0 && (
          <div>
            <label className="block mb-2 text-xs font-normal text-slate-500">
              {strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_ARGUMENTS_LABEL}
            </label>
            <div className="space-y-2">
              {selectedQuery.dataQueryOptions.args.map((arg, argIndex) => {
                const argName = arg.key;
                return (
                  <div key={`arg-${argIndex}`} className='flex flex-row justify-between items-center'>
                    <input
                      type="text"
                      id={`arg-${argName}`}
                      className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
                      placeholder={`Value for ${argName}`}
                      value={
                        configurationForm.values.args?.[argName] || ""
                      }
                      onChange={(e) =>
                        _handleUpdateDatasetQueryArgs(argName, e.target.value)
                      }
                      onBlur={configurationForm.handleBlur}
                    />
                    <button
                      type="button"
                      
                      className="ml-2  bg-white p-1.5 text-slate-700 border border-slate-200 rounded"
                    >
                      <VscJson className="w-4 h-4 " />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <button
          type='button'
          onClick={configurationForm.handleSubmit}
          className="px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none"
        >
          {strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_SAVE_BUTTON}
        </button>
      </form>
    </div>
  );
};

export const DataQueryNode = memo(({ data, isConnectable }) => {
  const { dataQueries, strings } = useWorkflowNodes();
  const [selectedQueryTitle, setSelectedQueryTitle] = useState("Select a Query");

  useEffect(() => {
    if (data.dataQueryID && dataQueries) {
      const query = dataQueries.find(q => q.dataQueryID === data.dataQueryID);
      setSelectedQueryTitle(query?.dataQueryTitle || "Unknown Query");
    } else {
      setSelectedQueryTitle("Select a Query");
    }
  }, [data.dataQueryID, dataQueries]);

  return (
    <div className="bg-white border rounded shadow-md min-w-[250px] max-w-[300px] hover:border-blue-400 transition-colors">
      <div className="bg-blue-50 px-2 py-1 border-b rounded-t font-semibold flex justify-between items-center">
        
        <div className='flex flex-col justify-start items-start w-full'>
          <span className=' font-normal text-slate-500 truncate max-w-[100px] text-xs'>{data?.title ? data.title : 'Untitled node'}</span>
          <span className=" font-normal text-slate-500 text-[10px]">{strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_LABEL}</span>
        </div>
        
        <button type='button' className='text-red-500 text-xs bg-transparent p-1 outline-none rounded border-none hover:bg-red-100 !hover:border-red-200 ml-2'>
          <MdOutlineDeleteOutline className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3 text-sm">
        <div className="font-medium text-slate-700 flex items-center gap-2">
          <SiQuantconnect className="text-blue-500 text-lg" />
          {selectedQueryTitle}
        </div>
        {data.args && Object.keys(data.args).length > 0 && (
          <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
            {Object.keys(data.args).length} argument(s) configured
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-400"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        isConnectable={isConnectable}
        style={{
          left: '25%',
          backgroundColor: '#22c55e', // green-500
          width: '20px',
          height: '6px',
          borderRadius: '0px',
          border: 'none'
        }}
      />

      {/* Error Handle (Right side of bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        isConnectable={isConnectable}
        style={{
          left: '75%',
          backgroundColor: '#ef4444', // red-500
          width: '20px',
          height: '6px',
          borderRadius: '0px',
          border: 'none'
        }}
      />
    </div>
  );
});
