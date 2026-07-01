import re

with open('server.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# For any microserviceService.[method]() -> microserviceService.[method](req.user?.tenantId || 'default')
code = re.sub(
    r'microserviceService\.([a-zA-Z0-9_]+)\(\)',
    r"microserviceService.\g<1>(req.user?.tenantId || 'default')",
    code
)

# For any microserviceService.[method](req.body) -> microserviceService.[method](req.user?.tenantId || 'default', req.body)
code = re.sub(
    r'microserviceService\.([a-zA-Z0-9_]+)\(req\.body\)',
    r"microserviceService.\g<1>(req.user?.tenantId || 'default', req.body)",
    code
)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(code)
print('Server.ts updated')
