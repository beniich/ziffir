import re

with open('src/server/microservices.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Update getSettingDoc
code = re.sub(
    r'async function getSettingDoc<T>\(id: string, defaultData: T\): Promise<T> \{',
    'async function getSettingDoc<T>(tenantId: string, id: string, defaultData: T): Promise<T> {',
    code
)
code = re.sub(
    r"const docRef = doc\(db, 'settings', id\);",
    "const docRef = doc(db, 'tenants', tenantId || 'default', 'settings', id);",
    code
)

# Update saveSettingDoc
code = re.sub(
    r'async function saveSettingDoc<T>\(id: string, data: T\): Promise<void> \{',
    'async function saveSettingDoc<T>(tenantId: string, id: string, data: T): Promise<void> {',
    code
)

# Replace in getAllStates:
code = re.sub(r'async getAllStates\(\) \{', 'async getAllStates(tenantId: string) {', code)
code = re.sub(r'(await getSettingDoc<[^>]+>\()(\'cockpit_[a-z_]+\')', r'\g<1>tenantId, \g<2>', code)

# Replace the get/save functions
code = re.sub(r'async (get[A-Z][a-zA-Z0-9_]*)\(\) \{ return getSettingDoc<([^>]+)>\(', r'async \g<1>(tenantId: string) { return getSettingDoc<\g<2>>(tenantId, ', code)

code = re.sub(r'async (save[A-Z][a-zA-Z0-9_]*)\(data: ([^)]+)\) \{ return saveSettingDoc<([^>]+)>\(', r'async \g<1>(tenantId: string, data: \g<2>) { return saveSettingDoc<\g<3>>(tenantId, ', code)

with open('src/server/microservices.ts', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
