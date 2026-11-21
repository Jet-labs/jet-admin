import { createWorkflowAPI } from '../src/data/apis/workflow';
import axios from 'axios';

jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('../src/config/firebase', () => ({ firebaseAuth: { currentUser: { getIdToken: async () => 'test-auth' } } }));
jest.mock('../src/constants', () => ({ CONSTANTS: { SERVER_HOST: '', APIS: { WORKFLOW: { createWorkflowAPI: () => '/workflows' } }, ERROR_CODES: {} } }));

test('workflow creation returns the saved identity for subsequent test-run attribution', async () => {
  axios.post.mockResolvedValue({ data: { success: true, workflow: { workflowID: 'saved-workflow', title: 'Created' } } });
  await expect(createWorkflowAPI({ tenantID: 'test', workflowData: { title: 'Created' } }))
    .resolves.toEqual({ workflowID: 'saved-workflow', title: 'Created' });
});
