import fs from 'fs';
import path from 'path';

// Mapeamento de renumeração
// US-001 a US-018 → US-006 a US-023 (já feito)
// AC-001 a AC-042 → AC-012 a AC-053 (já feito)
// ASM-001 a ASM-008 → ASM-005 a ASM-012
// Q-001 a Q-008 → Q-003 a Q-010

const asmMap = {};
for (let i = 1; i <= 8; i++) {
  const old = `ASM-${String(i).padStart(3, '0')}`;
  const newNum = i + 4;
  const newCode = `ASM-${String(newNum).padStart(3, '0')}`;
  asmMap[old] = newCode;
}

const qMap = {};
for (let i = 1; i <= 8; i++) {
  const old = `Q-${String(i).padStart(3, '0')}`;
  const newNum = i + 2;
  const newCode = `Q-${String(newNum).padStart(3, '0')}`;
  qMap[old] = newCode;
}

console.log('Mapeamento ASM:', asmMap);
console.log('Mapeamento Q:', qMap);

// Função para renumerar um arquivo
function renumerar(filePath, map) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Ordenar chaves por número decrescente para evitar substituições parciais
  const keys = Object.keys(map).sort((a, b) => {
    const numA = parseInt(a.split('-')[1]);
    const numB = parseInt(b.split('-')[1]);
    return numB - numA;
  });

  for (const oldCode of keys) {
    const newCode = map[oldCode];
    // Usar regex com word boundary para não substituir parcialmente
    const regex = new RegExp(`\\b${oldCode}\\b`, 'g');
    content = content.replace(regex, newCode);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ ${filePath} renumerado`);
}

// Renumerar spec.md
const specPath = path.join(process.cwd(), 'spec.md');
const tasksPath = path.join(process.cwd(), 'tasks.md');

console.log('\nRenumerando suposições (ASM)...');
renumerar(specPath, asmMap);
renumerar(tasksPath, asmMap);

console.log('\nRenumerando perguntas (Q)...');
renumerar(specPath, qMap);
renumerar(tasksPath, qMap);

console.log('\n✅ Renumeração ASM e Q concluída!');
console.log('\nNovos códigos:');
console.log('- Suposições: ASM-005 a ASM-012');
console.log('- Perguntas: Q-003 a Q-010');
