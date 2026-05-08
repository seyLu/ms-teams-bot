var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? (o, m, k, k2) => {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (
                  !desc ||
                  ('get' in desc
                      ? !m.__esModule
                      : desc.writable || desc.configurable)
              ) {
                  desc = { enumerable: true, get: () => m[k] };
              }
              Object.defineProperty(o, k2, desc);
          }
        : (o, m, k, k2) => {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? (o, v) => {
              Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v,
              });
          }
        : (o, v) => {
              o['default'] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    (() => {
        var ownKeys = (o) => {
            ownKeys =
                Object.getOwnPropertyNames ||
                ((o) => {
                    var ar = [];
                    for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
                    return ar;
                });
            return ownKeys(o);
        };
        return (mod) => {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++)
                    if (k[i] !== 'default') __createBinding(result, mod, k[i]);
            __setModuleDefault(result, mod);
            return result;
        };
    })();
Object.defineProperty(exports, '__esModule', { value: true });
require('./env');
const http = __importStar(require('http'));
async function startServer() {
    let errToReport = null;
    try {
        const app = require('./app/app').default;
        try {
            await app.start(process.env.PORT || process.env.port || 3978);
            console.log(
                `\nAgent started, app listening to`,
                process.env.PORT || process.env.port || 3978,
            );
            return; // successfully started!
        } catch (e) {
            errToReport = e;
            console.error('app.start crashed:', e);
        }
    } catch (e) {
        errToReport = e;
        console.error('require app crashed:', e);
    }
    // if we reached here, there was an error
    http.createServer((req, res) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(
            errToReport?.stack || errToReport?.toString() || 'Unknown error',
        );
    }).listen(process.env.PORT || process.env.port || 3978);
}
startServer();
//# sourceMappingURL=index.js.map
