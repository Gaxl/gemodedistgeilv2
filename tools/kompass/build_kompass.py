# Erzeugt die Kompass-Konfiguration fuer "alles ortbar ausser den Legendaeren-Tempeln":
#  - config/omnicompass-common.toml  (structure_blacklist, exakte IDs)
#  - config/explorerscompass-common.toml (structureBlacklist, Platzhalter)
#  - Datapack moonlight-global-datapacks/gig_hoen: Kompass-Typen "legend_<key>" fuer Turnier-Gewinner
#  - kubejs/server_scripts/turnier_kompass.js: Auswahl-Befehl (aus kompass_tempel.json erzeugt)
# Aufruf aus dem Repo-Wurzelordner: python tools/kompass/build_kompass.py <mods-ordner>
import json, os, re, sys, zipfile

repo = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
mods = sys.argv[1] if len(sys.argv) > 1 else os.path.join(repo, '..', 'testserver-v2', 'mods')
cfg = json.load(open(os.path.join(os.path.dirname(__file__), 'kompass_tempel.json'), encoding='utf-8'))

# --- alle Struktur-IDs der Legendaeren-Mods einsammeln ---
ids = set()
def scan_zip(path, ns):
    with zipfile.ZipFile(path) as z:
        for n in z.namelist():
            m = re.match(r'data/([^/]+)/worldgen/structure/(.+)\.json$', n)
            if m and m.group(1) == ns:
                ids.add(m.group(1) + ':' + m.group(2))
for f in os.listdir(mods):
    if f.lower().startswith('legendarymonuments'):
        scan_zip(os.path.join(mods, f), 'legendarymonuments')
    if f.lower().startswith('monuments of hoen'):
        scan_zip(os.path.join(mods, f), 'hoenmonuments')
dp = os.path.join(repo, 'moonlight-global-datapacks', 'gig_hoen', 'data', 'gig_hoen', 'worldgen', 'structure')
for root, _, files in os.walk(dp):
    for x in files:
        if x.endswith('.json'):
            rel = os.path.relpath(os.path.join(root, x), dp).replace(os.sep, '/')[:-5]
            ids.add('gig_hoen:' + rel)
# Strukturen im Legendaeren-Dorf, die selbst NICHT legendaer sind: bleiben ortbar
EXEMPT = {'legendarymonuments:traditional_village/nonlegendary', 'legendarymonuments:traditional_village/dojo'}
ids = sorted(ids - EXEMPT)
print(len(ids), 'Legendaeren-Strukturen gesperrt fuer allgemeine Kompasse (ausgenommen:', sorted(EXEMPT), ')')

# --- OmniCompass: exakte Liste in die Config schreiben (nur die structure_blacklist-Zeile ersetzen) ---
def set_line(path, key, value_text):
    s = open(path, encoding='utf-8').read()
    new, n = re.subn(r'(?m)^(\s*%s\s*=).*$' % re.escape(key), lambda m: m.group(1) + ' ' + value_text, s)
    assert n == 1, (path, key, n)
    open(path, 'w', encoding='utf-8', newline='\n').write(new)

set_line(os.path.join(repo, 'config', 'omnicompass-common.toml'), 'structure_blacklist', json.dumps(ids))
# --- Explorer's Compass: Platzhalter ---
set_line(os.path.join(repo, 'config', 'explorerscompass-common.toml'), 'structureBlacklist', json.dumps(['hoenmonuments:*', 'gig_hoen:*'] + [i for i in ids if i.startswith('legendarymonuments:')]))

# --- Datapack: Kompass-Typen fuer die Turnier-Auswahl ---
out = os.path.join(repo, 'moonlight-global-datapacks', 'gig_hoen', 'data', 'gig_hoen', 'omnicompass', 'compass_type')
os.makedirs(out, exist_ok=True)
for key, t in cfg['tempel'].items():
    missing = [s for s in t['strukturen'] if s not in ids and not s.startswith('legendarymonuments:traditional_village/')]
    if missing:
        print('WARNUNG: unbekannte Struktur in', key, missing)
    d = {
        'entries': [{'type': 'omnicompass:structure', 'name': s, 'conditions': []} for s in t['strukturen']],
        'needle_color': t.get('nadel', 11591910),
        'needle_shade_color': t.get('nadel', 11591910),
    }
    with open(os.path.join(out, 'legend_%s.json' % key), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(d, f, indent=2)

# --- KubeJS-Auswahl-Skript aus der Vorlage ---
tpl = open(os.path.join(os.path.dirname(__file__), 'turnier_kompass.template.js'), encoding='utf-8').read()
liste = [{'key': k, 'name': t['name'], 'pokemon': t['pokemon']} for k, t in cfg['tempel'].items()]
js = tpl.replace('/*TEMPEL*/[]', json.dumps(liste, ensure_ascii=False, indent=2))
open(os.path.join(repo, 'kubejs', 'server_scripts', 'turnier_kompass.js'), 'w', encoding='utf-8', newline='\n').write(js)
print('Kompass-Typen:', len(cfg['tempel']))
