import { getStoreArray, pushStoreItem, setStore } from "@control/storage.control";

type LocalEmailParams = {
	subject: string;
	body: string;
	from: string;
	to: string;
	attachments?: { type: 'link', label: string; value: string; }[];
}

export type LocalEmail = LocalEmailParams & {
	createdAt: number | string;
};

const emailStorage = 'local-emails';

export function createLocalEmail({ subject, body, from, to, attachments = [] }: LocalEmailParams): LocalEmail{
	const record: LocalEmail = { subject, body, from, to, attachments, createdAt: new Date().toISOString() };

	pushStoreItem(emailStorage, record);

	return record;
}

export function setLocalEmails(emails: LocalEmail[]) {
	setStore(emailStorage, JSON.stringify(emails));
}

export function getLocalEmails(): LocalEmail[] {
    return getStoreArray<LocalEmail>(emailStorage);
}