import {Observable, BehaviorSubject, Subject} from 'rx';

const redix = () => {
	const dispatcher = new BehaviorSubject();
	const actions = {};
	const store = new Subject();

	return {
		registerReducer: (action, reducer) => {
			dispatcher
				.filter(obj => {
					return obj && obj.action === action
				})
				.map(obj => obj.observable)
				.flatMap(obs => {
					return obs;
				})
				.scan(reducer)
				.subscribe(data => {
					store.onNext({action, data});
				});
		},
		registerAction: (action, actionHandler) => {
			actions[action] = actionHandler;
		},
		triggerAction: (action, data) => {
			dispatcher.onNext(
				{action, observable: Observable.fromPromise(actions[action](data))}
			);
		},
		subscribe: (successCb, errorCb, completeCb) => {
			return store
				.subscribe(successCb, errorCb, completeCb);
		}
	}
}

export default redix;
