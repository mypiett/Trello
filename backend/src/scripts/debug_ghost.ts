
import { AppDataSource } from '../config/data-source';
import { Board } from '../common/entities/board.entity';
import { BoardMembers } from '../common/entities/board-member.entity';
import { User } from '../common/entities/user.entity';

async function debugGhost() {
    try {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');

        const boards = await AppDataSource.getRepository(Board).find({
            relations: ['workspace', 'boardMembers', 'boardMembers.user']
        });

        console.log(`\n=== Total Boards: ${boards.length} ===\n`);

        for (const board of boards) {
            console.log(`Board: [${board.title}] (ID: ${board.id})`);
            console.log(`  - Visibility: '${board.visibility}'`); // Quote to see if any spaces or casing
            console.log(`  - Workspace: ${board.workspace?.title}`);
            console.log(`  - Closed: ${board.isClosed}`);
            console.log(`  - Members (${board.boardMembers.length}):`);

            board.boardMembers.forEach(bm => {
                console.log(`    - [${bm.user.name}] (${bm.user.email}) - Role: ${bm.roleId} - Status: ${bm.status}`);
            });
            console.log('-------------------------------------------');
        }

        const users = await AppDataSource.getRepository(User).find();
        console.log(`\n=== Total Users: ${users.length} ===\n`);
        users.forEach(u => console.log(`User: ${u.name} (${u.email}) ID: ${u.id}`));

    } catch (err) {
        console.error('Error during debug:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

debugGhost();
