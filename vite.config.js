import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'save-game-api',
      configureServer(server) {
        server.middlewares.use('/api/save-game', async (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const { id, name, imageData } = JSON.parse(body);

                // 1. Criar pasta public/map/ID
                const mapDir = path.resolve(__dirname, `public/map/${id}`);
                if (!fs.existsSync(mapDir)) {
                  fs.mkdirSync(mapDir, { recursive: true });
                }

                // 2. Salvar imagem map.png
                const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
                fs.writeFileSync(path.join(mapDir, 'map.png'), base64Data, 'base64');

                // 3. Atualizar ou criar o games.json com a estrutura completa
                const jsonPath = path.resolve(__dirname, 'public/games.json');
                let games = [];
                if (fs.existsSync(jsonPath)) {
                  games = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                }

                const existingIndex = games.findIndex(g => g.id === id.toString());
                
                // Formato padronizado igual ao original
                const newGameData = {
                  id: id.toString(),
                  title: name || `Jogo ${id}`,
                  creator: "Lucazinho1002",
                  updated: new Date().toISOString().split('T')[0], // Pega a data de hoje (YYYY-MM-DD)
                  favorited: 0,
                  played: 0,
                  online: 0,
                  description: "Jogo criado no Editor."
                };

                if (existingIndex >= 0) {
                  // Mantém as estatísticas antigas se o jogo já existir
                  games[existingIndex] = {
                    ...games[existingIndex],
                    title: newGameData.title,
                    updated: newGameData.updated
                  };
                } else {
                  games.push(newGameData);
                }

                fs.writeFileSync(jsonPath, JSON.stringify(games, null, 2));

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'Jogo e mapa salvos com sucesso!' }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          }
        });
      }
    }
  ],
  publicDir: false,
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  base: './'
});