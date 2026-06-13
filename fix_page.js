const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/pipelines/page.tsx', 'utf8');

// 1. useState<any>
content = content.replace(/useState<any>\(null\)/g, 'useState<Record<string, unknown> | null>(null)');

// 2. useState<any[]>([])
content = content.replace(/useState<any\[\]>\(\[\]\)/g, 'useState<Record<string, unknown>[]>([])');

// 3. ticketsToEdit: any[]
content = content.replace(/ticketsToEdit: any\[\]/g, 'ticketsToEdit: Record<string, unknown>[]');

// 4. entities typing
content = content.replace(/if \(Array\.isArray\(resultPayload\.entities\)\) \{/g, 'const entities = resultPayload.entities as Record<string, unknown> | undefined;\n      if (Array.isArray(entities)) {');

content = content.replace(/ticketsToEdit = resultPayload\.entities;/g, 'ticketsToEdit = entities;');
content = content.replace(/\} else if \(resultPayload\.entities\?\.extracted_tickets\) \{/g, '} else if (entities?.extracted_tickets) {');
content = content.replace(/ticketsToEdit = resultPayload\.entities\.extracted_tickets;/g, 'ticketsToEdit = entities.extracted_tickets as Record<string, unknown>[];');
content = content.replace(/\} else if \(resultPayload\.entities\?\.retro_categories\?\.action_items\) \{/g, '} else if ((entities?.retro_categories as any)?.action_items) {');
content = content.replace(/ticketsToEdit = resultPayload\.entities\.retro_categories\.action_items;/g, 'ticketsToEdit = (entities?.retro_categories as any).action_items;');

// 5. findArray
content = content.replace(/const findArray = \(obj: any\): any\[\] \| null => \{/g, 'const findArray = (obj: unknown): Record<string, unknown>[] | null => {');

content = content.replace(/if \(Array\.isArray\(obj\)\) return obj;/g, 'if (Array.isArray(obj)) return obj as Record<string, unknown>[];');

// 6. map((t: any, i: number)
content = content.replace(/map\(\(t: any, i: number\)/g, 'map((t: Record<string, unknown>, i: number)');

// 7. filter((r: any)
content = content.replace(/filter\(\(r: any\)/g, 'filter((r: { status: string })');

// 8. as any
content = content.replace(/onChange=\{\(e\) => setSchemaMode\(e\.target\.value as any\)\}/g, 'onChange={(e) => setSchemaMode(e.target.value as "standup" | "retro")}');

// 9. Unescaped entities
content = content.replace(/>"\{currentTranscript\}"</g, '>&quot;{currentTranscript}&quot;<');
content = content.replace(/The AI couldn't find/g, 'The AI couldn\\'t find');

fs.writeFileSync('src/app/dashboard/pipelines/page.tsx', content);
