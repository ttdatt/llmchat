export type AddThread = {
	type: 'add-thread';
	threadId: string;
};

export type DeleteThread = {
	type: 'delete-thread';
	threadId: string;
};

export type WorkerData = AddThread | DeleteThread;

export type WorkerResponse = {
	from: string;
	success: boolean;
	error?: string;
};
