export type ApprovalStatus = 'PENDING' | 'HR_SUBMITTED' | 'DIRECTOR_APPROVED';

const STORAGE_KEY = 'mhc9_daily_approvals';

interface ApprovalStore {
    [date: string]: ApprovalStatus; // date format: YYYY-MM-DD
}

const getStore = (): ApprovalStore => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
};

const saveStore = (store: ApprovalStore) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const getDailyApprovalStatus = (date: string): ApprovalStatus => {
    const store = getStore();
    return store[date] || 'PENDING';
};

export const submitForDirectorApproval = (date: string): void => {
    const store = getStore();
    store[date] = 'HR_SUBMITTED';
    saveStore(store);
};

export const approveByDirector = (date: string): void => {
    const store = getStore();
    store[date] = 'DIRECTOR_APPROVED';
    saveStore(store);
};

export const resetApprovalStatus = (date: string): void => {
    const store = getStore();
    store[date] = 'PENDING';
    saveStore(store);
};
