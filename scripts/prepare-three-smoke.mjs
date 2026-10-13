// CI専用の新規案件に標準3D部品を配置。既存案件は変更しない。
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/production.mjs';
import { createProject } from './new-project.mjs';
const dir = createProject({ name:'ci-three-smoke', template:'creative-3d' });
const main = path.join(dir,'src/main.jsx');
fs.writeFileSync(main,fs.readFileSync(main,'utf8').replace("import './style.css';", "import './style.css';\nimport OptionalScene from './OptionalScene.jsx';").replace('<footer>','<OptionalScene/><footer>'));
fs.copyFileSync(path.join(ROOT,'templates/creative-3d/three.spec.js'),path.join(dir,'tests/three.spec.js'));
