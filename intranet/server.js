const http = require("http");
const os = require("os");

const hostname = os.hostname();

http.createServer((req, res) => {
  if (req.url === "/hostname") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(hostname);
    return;
  }

  if (req.url.startsWith("/upload") && req.method === "POST") {
    const params = new URLSearchParams(req.url.split("?")[1]);
    const usuario = params.get("usuario");

    if (usuario === "visitante") {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Acesso negado! O usuário visitante não tem permissão para fazer upload.");
      return;
    }

    let body = [];
    req.on("data", chunk => body.push(chunk));
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Upload realizado com sucesso pelo funcionario!");
    });
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <title>XPTO Intranet</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #f4f6f9; color: #333; min-height: 100vh; }

        header {
          background: #1a237e;
          color: white;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        header h1 { font-size: 1.3rem; letter-spacing: 1px; }
        .badge {
          background: #283593;
          border: 1px solid #3949ab;
          color: #90caf9;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-family: monospace;
        }

        main { max-width: 900px; margin: 40px auto; padding: 0 24px; }

        .welcome {
          background: white;
          border-radius: 10px;
          padding: 28px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-left: 4px solid #1a237e;
        }
        .welcome h2 { font-size: 1.2rem; margin-bottom: 8px; color: #1a237e; }
        .welcome p { color: #666; font-size: 0.95rem; }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .card {
          background: white;
          border-radius: 10px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .card .icon { font-size: 2rem; margin-bottom: 12px; }
        .card h3 { font-size: 1rem; margin-bottom: 6px; color: #1a237e; }
        .card p { font-size: 0.85rem; color: #888; }

        .upload-box {
          background: white;
          border-radius: 10px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          margin-bottom: 24px;
        }
        .upload-box h2 { font-size: 1.1rem; margin-bottom: 20px; color: #1a237e; border-bottom: 1px solid #eee; padding-bottom: 12px; }
        label { font-size: 0.85rem; font-weight: 600; color: #555; display: block; margin-bottom: 6px; margin-top: 14px; }
        select, input[type=file] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          background: #fafafa;
        }
        .btn {
          margin-top: 20px;
          padding: 10px 28px;
          background: #1a237e;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn:hover { background: #283593; }
        #resultado {
          margin-top: 14px;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          display: none;
        }
        .sucesso { background: #e8f5e9; color: #2e7d32; display: block !important; }
        .erro { background: #ffebee; color: #c62828; display: block !important; }

        .lb-box {
          background: white;
          border-radius: 10px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          margin-bottom: 24px;
        }
        .lb-box h2 { font-size: 1.1rem; margin-bottom: 16px; color: #1a237e; border-bottom: 1px solid #eee; padding-bottom: 12px; }
        #servidor { font-weight: bold; color: #1a237e; }
        #log { margin-top: 14px; font-family: monospace; font-size: 0.85rem; color: #555; max-height: 120px; overflow-y: auto; }

        footer {
          text-align: center;
          padding: 24px;
          color: #aaa;
          font-size: 0.8rem;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>🏢 XPTO — Portal Intranet</h1>
        <span class="badge">🖥 ${hostname}</span>
      </header>
      <main>
        <div class="welcome">
          <h2>Bem-vindo ao Portal Interno da XPTO</h2>
          <p>Acesse os recursos da empresa, envie documentos e utilize os serviços internos.</p>
        </div>

        <div class="card-grid">
          <div class="card">
            <div class="icon">💻</div>
            <h3>Suporte TI</h3>
            <p>Abra chamados e acesse sistemas</p>
          </div>
          <div class="card">
            <div class="icon">📄</div>
            <h3>Documentos</h3>
            <p>Formulários e comunicados oficiais</p>
          </div>
          <div class="card">
            <div class="icon">📢</div>
            <h3>Avisos</h3>
            <p>Reunião geral na sexta às 10h</p>
          </div>
        </div>

        <div class="lb-box">
          <h2>🔄 Balanceamento de Carga</h2>
          <p>Servidor atual: <span id="servidor">${hostname}</span></p>
          <button class="btn" onclick="testar()">Fazer nova requisição</button>
          <div id="log"></div>
        </div>

        <div class="upload-box">
          <h2>📤 Upload de Documentos</h2>
          <label>Usuário:</label>
          <select id="usuario">
            <option value="funcionario">funcionario</option>
            <option value="visitante">visitante</option>
          </select>
          <label>Arquivo:</label>
          <input type="file" id="arquivo" />
          <button class="btn" onclick="enviar()">Enviar arquivo</button>
          <div id="resultado"></div>
        </div>
      </main>

      <footer>XPTO Empresa &nbsp;|&nbsp; Portal Intranet &nbsp;|&nbsp; Servidor: ${hostname}</footer>

      <script>
        let count = 1;
        async function testar() {
          const res = await fetch("/hostname");
          const nome = await res.text();
          document.getElementById("servidor").textContent = nome;
          const log = document.getElementById("log");
          log.innerHTML += "Requisição " + count++ + " → " + nome + "<br>";
          log.scrollTop = log.scrollHeight;
        }
        async function enviar() {
          const usuario = document.getElementById("usuario").value;
          const arquivo = document.getElementById("arquivo").files[0];
          const resultado = document.getElementById("resultado");
          if (!arquivo) {
            resultado.textContent = "Selecione um arquivo!";
            resultado.className = "erro";
            return;
          }
          const formData = new FormData();
          formData.append("arquivo", arquivo);
          const res = await fetch("/upload?usuario=" + usuario, { method: "POST", body: formData });
          const texto = await res.text();
          resultado.textContent = texto;
          resultado.className = res.ok ? "sucesso" : "erro";
        }
      </script>
    </body>
    </html>
  `);
}).listen(80);
