const fs = require('fs');
const path = require('path');

const files = [
  'springfree-1789132223953-mtysujme.svg',
  'zoefull-1789132224442-mtysu303.svg',
  'nutradora-1789132224780-mtysu32b.svg',
  'mahaekart-1789132225061-mtysu33w.svg',
  'ta-chat-1789132225316-mtysu35q.svg',
  'c-a-1789132225599-mtysu372.svg',
  'ppc-legend-1789132225881-mtysu38j.svg',
  'jack2-media-1789132226195-mtysu39v.svg',
  'ajh-accountant-1789132226456-mtysu3be.svg',
  'amplify-1789132226716-mtysu3d6.svg',
];

for (const f of files) {
  const p = path.resolve(__dirname, '../../../apps/web/public/clients', f);
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  const fills = s.match(/fill="[^"]*"/g) || [];
  console.log(f, '->', fills);
}
