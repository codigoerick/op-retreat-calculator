import json
import os

# Load talents data
with open('src/data/talents.json', 'r') as f:
    talents = json.load(f)

talents_map = {t['id']: t for t in talents}

# Build rows (from level 21 down to 0)
rows = []
for i in range(21, -1, -1):
    rows.append([i * 3 + 1, i * 3 + 2, i * 3 + 3])
rows.append([0])

html_output = """<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Node Tree Reference</title>
    <style>
        :root {
            --color-bg-dark: #292929;
            --talent-node-size: 100px;
            --talent-bg-size: 96px;
            --talent-icon-size: 50px;
            --talent-star-size: 11px;
            --talent-lock-size: 40px;
            --talent-row-gap: 25px;
        }
        body { 
            background: var(--color-bg-dark); 
            color: white; 
            font-family: sans-serif; 
            display: flex; 
            justify-content: center; 
            padding: 50px 0; 
            margin: 0;
        }
        .talent__tree { 
            width: 100%; 
            max-width: 800px; 
        }
        .talent__rows__container { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            row-gap: var(--talent-row-gap); 
        }
        .talent__row { 
            display: flex; 
        }
        .talent__row--single { 
            justify-content: center; 
        }
        .talent__node {
            background-image: url('../public/assets/images/backgrounds/talent_node_bg.png');
            background-size: contain; 
            background-repeat: no-repeat; 
            background-position: center;
            width: var(--talent-node-size); 
            height: var(--talent-node-size);
            display: flex; 
            justify-content: center; 
            align-items: center; 
            position: relative;
        }
        .talent__bg {
            background-size: contain; 
            background-repeat: no-repeat; 
            background-position: center;
            width: var(--talent-bg-size); 
            height: var(--talent-bg-size);
            display: flex; 
            justify-content: center; 
            align-items: center; 
            position: relative;
        }
        .talent__bg__red { background-image: url('../public/assets/images/backgrounds/bg_red.png'); }
        .talent__bg__blue { background-image: url('../public/assets/images/backgrounds/bg_blue.png'); }
        .talent__bg__green { background-image: url('../public/assets/images/backgrounds/bg_green.png'); }
        .talent__icon { width: var(--talent-icon-size); height: var(--talent-icon-size); object-fit: contain; }
        .talent__level-bar {
            position: absolute; 
            bottom: 1px; 
            left: 50%; 
            transform: translateX(-50%);
            width: 100%; 
            display: flex; 
            justify-content: center; 
            gap: 4px;
            background: rgba(0,0,0,0.5); 
            padding: 3px 0; 
            border-radius: 0 0 10px 10px;
        }
        .talent__level-star { width: var(--talent-star-size); height: var(--talent-star-size); }
        .connection__horizontal__bg {
            width: 40px; 
            height: 15px; 
            align-self: center;
            background-image: url('../public/assets/images/icons/talent_progressBg.png');
            background-size: 100% 100%; 
            display: flex; 
            justify-content: center; 
            align-items: center;
        }
        .connection__vertical__bg {
            width: 15px; 
            height: 25px; 
            position: absolute; 
            bottom: -25px; 
            left: 50%; 
            transform: translateX(-50%);
            background-image: url('../public/assets/images/icons/talent_progressBg.png');
            background-size: 100% 100%;
        }
        .connection__diagonal__left__bg {
            width: 18px; 
            height: 175px; 
            position: absolute; 
            bottom: -125px; 
            left: 50%;
            transform: translateX(-50%) rotate(-45deg); 
            transform-origin: top center;
            background-image: url('../public/assets/images/icons/talent_progressBg.png');
            background-size: 100% 100%; 
            z-index: -1;
        }
        .connection__diagonal__right__bg {
            width: 18px; 
            height: 175px; 
            position: absolute; 
            bottom: -125px; 
            left: 50%;
            transform: translateX(-50%) rotate(45deg); 
            transform-origin: top center;
            background-image: url('../public/assets/images/icons/talent_progressBg.png');
            background-size: 100% 100%; 
            z-index: -1;
        }
    </style>
</head>
<body>
    <section class='talent__tree'>
        <div class='talent__rows__container'>
"""

for row in rows:
    row_class = 'talent__row--single' if len(row) == 1 else ''
    html_output += f"            <div class='talent__row {row_class}'>\n"
    for i, node_id in enumerate(row):
        t = talents_map.get(node_id)
        if not t: continue
        
        # Connections (simplified logic for static export)
        connections = ""
        if node_id == 1: 
            connections = "<div class='connection__diagonal__left__bg'></div>"
        elif node_id == 3: 
            connections = "<div class='connection__diagonal__right__bg'></div>"
        elif node_id == 2: 
            connections = "<div class='connection__vertical__bg'></div>"
        elif node_id > 3: 
            connections = "<div class='connection__vertical__bg'></div>"

        html_output += f"""                <div class='talent__node' data-id='{node_id}'>
                    <div class='talent__bg {t['bgClass']}'>
                        <img src='../public/{t['icon']}' class='talent__icon'>
                        <div class='talent__level-bar'>
                            <img src='../public/assets/images/icons/talent-level.webp' class='talent__level-star'>
                            <img src='../public/assets/images/icons/talent-level.webp' class='talent__level-star'>
                            <img src='../public/assets/images/icons/talent-level.webp' class='talent__level-star'>
                            <img src='../public/assets/images/icons/talent-level.webp' class='talent__level-star'>
                            <img src='../public/assets/images/icons/talent-level.webp' class='talent__level-star'>
                        </div>
                    </div>
                    {connections}
                </div>
"""
        if i < len(row) - 1:
            html_output += "                <div class='connection__horizontal__bg'></div>\n"
    html_output += "            </div>\n"

html_output += """        </div>
    </section>
</body>
</html>"""

os.makedirs('node_tree_reference', exist_ok=True)
with open('node_tree_reference/node_tree.html', 'w') as f:
    f.write(html_output)
print("SUCCESS: node_tree_reference/node_tree.html created.")
