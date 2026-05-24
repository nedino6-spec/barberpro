const fs = require('fs');
let data = fs.readFileSync('prisma/schema.prisma', 'utf8');
data = data.replace(/tenantId\s+String\s+@default\("default-tenant-id"\)/g, 'tenantId String?');
data = data.replace(/tenant\s+Tenant\s+@relation\(fields: \[tenantId\], references: \[id\]\)/g, 'tenant Tenant? @relation(fields: [tenantId], references: [id])');
fs.writeFileSync('prisma/schema.prisma', data);
