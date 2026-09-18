import fs from 'fs';

let tableCode = fs.readFileSync('src/web/components/ledger/DirectoryTable.tsx', 'utf8');

tableCode = tableCode.replace(
  '        </div>\n        </div>\n        ) : visible.length === 0 ? (',
  '        </div>\n        ) : visible.length === 0 ? ('
);

fs.writeFileSync('src/web/components/ledger/DirectoryTable.tsx', tableCode);

