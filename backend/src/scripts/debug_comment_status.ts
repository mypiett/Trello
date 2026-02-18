
import { AppDataSource } from '../config/data-source';
import { Board } from '../common/entities/board.entity';

async function run() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        const boardId = '96346223-c2c2-467d-b369-c31bcbfaad6e';
        const board = await AppDataSource.getRepository(Board).findOne({
            where: { id: boardId }
        });

        if (board) {
            console.log('--------------------------------------------------');
            console.log(`Board ID: ${board.id}`);
            console.log(`Title: ${board.title}`);
            console.log(`Comment Policy: '${board.commentPolicy}'`);
            console.log(`Member Manage Policy: '${board.memberManagePolicy}'`);
            console.log('--------------------------------------------------');
        } else {
            console.log('Board not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
