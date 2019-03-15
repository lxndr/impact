import useSubscribable from './use-subscribable';

/**
 * @template T
 * @param {import('rxjs').BehaviorSubject<T>} subject
 * @returns T
 */
const useBehaviorSubject = subject => useSubscribable(subject, subject.value);

export default useBehaviorSubject;
