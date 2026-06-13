import { after } from 'node:test';
import { closeDbPool } from '#core/server/lib/db.js';

/** Закрывает пул MySQL после spec-файла, чтобы процесс теста завершался. */
function useDbTeardown() {
	after(async () => {
		await closeDbPool();
	});
}

export { useDbTeardown };
