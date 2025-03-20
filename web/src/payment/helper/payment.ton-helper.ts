import { fromNano, Transaction } from '@ton/core';

export async function getTonTransactionDetails(transaction: Transaction) {
	const details = {
		sender: '',
		coins: '',
		comment: '',
		endStatus: transaction.endStatus,
		oldStatus: transaction.oldStatus,
		type: transaction.inMessage?.info.type,
	};

	try {
		const message = transaction.inMessage;

		if (message?.info.type == 'internal') {
			// we only process internal messages here because they are used the most
			// for external messages some of the fields are empty, but the main structure is similar
			const sender = message?.info.src;
			const value = message?.info.value.coins;

			details.sender = sender?.toString();
			details.coins = value.toString();

			const originalBody = message?.body.beginParse();
			let body = originalBody.clone();
			if (body.remainingBits < 32) {
				// if body doesn't have opcode: it's a simple message without comment
			} else {
				const op = body.loadUint(32);
				if (op == 0) {
					// if opcode is 0: it's a simple message with comment
					const comment = body.loadStringTail();

					details.comment = comment;
				}
			}
		}
	} catch (error) {}

	return details;
}
