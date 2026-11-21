import { appPageActions } from './appPageActions';

const coordinators = new WeakMap();
const signatureOf = value => JSON.stringify(value, (_key, item) =>
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]]))
    : item);

// One coordinator per provider dispatch: manual widget actions, reactive
// refreshes and polls share the same latest-request contract.
export function getQueryCoordinator(dispatch) {
  if (coordinators.has(dispatch)) return coordinators.get(dispatch);
  const entries = new Map();
  const retire = alias => {
    entries.get(alias)?.controller.abort();
    entries.delete(alias);
  };
  const coordinator = {
    retire,
    retireAll: () => { for (const alias of entries.keys()) retire(alias); },
    run({ alias, tenantID, queryID, inputValues, execute }) {
      const signature = signatureOf({ tenantID, queryID, inputValues });
      const previous = entries.get(alias);
      if (previous?.pending && previous.signature === signature) return previous.promise;
      retire(alias);
      const entry = { signature, controller: new AbortController(), pending: true };
      entries.set(alias, entry);
      const current = () => entries.get(alias) === entry;
      dispatch(appPageActions.setQueryLoading(alias));
      entry.promise = Promise.resolve().then(() => {
        if (!current()) return null;
        return execute({ tenantID, dataQueryID: queryID, inputValues, signal: entry.controller.signal });
      }).then(result => {
        if (!current()) return null;
        dispatch(appPageActions.setQueryResult(alias, result));
        return result;
      }).catch(error => {
        if (!current() || entry.controller.signal.aborted) return null;
        dispatch(appPageActions.setQueryResult(alias, null, error));
        throw error;
      }).finally(() => { entry.pending = false; });
      return entry.promise;
    },
  };
  coordinators.set(dispatch, coordinator);
  return coordinator;
}
