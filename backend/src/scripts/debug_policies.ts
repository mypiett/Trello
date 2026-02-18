
import { AppDataSource } from '../config/data-source';
import { Board } from '../common/entities/board.entity';
import { BoardMembers } from '../common/entities/board-member.entity';

async function debugPolicies() {
    try {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');

        const boardId = '96346223-c2c2-467d-b369-c31bcbfaad6e'; // From previous logs

        const board = await AppDataSource.getRepository(Board).findOne({
            where: { id: boardId },
            relations: ['boardMembers', 'boardMembers.user', 'boardMembers.role']
        });

        if (!board) {
            console.log('Board not found');
            return;
        }

        console.log(`\n=== Board: ${board.title} ===`);
        console.log(`ID: ${board.id}`);
        console.log(`Visibility: '${board.visibility}'`);
        console.log(`Comment Policy: '${board.commentPolicy}'`);
        console.log(`Member Manage Policy: '${board.memberManagePolicy}'`);
        console.log(`Workspace Members Can Edit/Join: ${board.workspaceMembersCanEditAndJoin}`);
        console.log('-------------------------------------------');

        console.log(`Members (${board.boardMembers.length}):`);
        board.boardMembers.forEach(bm => {
            console.log(`  - [${bm.user.name}] (${bm.user.email})`);
            console.log(`    Role: ${bm.role.name} (ID: ${bm.roleId})`);
            console.log(`    Status: ${bm.status}`);
        });

    } catch (err) {
        console.error('Error during debug:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

debugPolicies();
