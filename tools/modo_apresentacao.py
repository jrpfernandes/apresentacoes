"""Garante o Modo Apresentação em todas as apresentações do site.
Uso: python3 tools/modo_apresentacao.py   (rode depois de copiar uma apresentação nova ou atualizada)"""
import pathlib, re
TAG = '<script src="https://apresentacoes.celebrityglobalrealty.com/assets/modo-apresentacao.js?v=1" defer></script>'
root = pathlib.Path(__file__).resolve().parent.parent
for f in sorted(root.glob('**/index.html')):
    if f.parent == root or '.git' in f.parts: continue  # a home não é apresentação
    s = f.read_text(encoding='utf-8')
    s2 = re.sub(r'<script src="[^"]*modo-apresentacao\.js[^"]*" defer></script>', '', s)
    i = s2.lower().rfind('</body>')
    s2 = (s2[:i] + TAG + s2[i:]) if i >= 0 else s2 + TAG
    if s2 != s:
        f.write_text(s2, encoding='utf-8'); print('ok', f.relative_to(root))
