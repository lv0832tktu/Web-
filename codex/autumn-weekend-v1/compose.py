"""Compose editable SVGs; no changes to generated photo pixels."""
import base64,json,html
from pathlib import Path
ROOT=Path(__file__).resolve().parent
spec=json.loads((ROOT/'design-spec.json').read_text())
from PIL import Image
photos={}
for i in range(1,6):
 file=ROOT/'assets'/f'IMG{i:02d}.png';w,h=Image.open(file).size
 photos[i]=(base64.b64encode(file.read_bytes()).decode(),w,h)
fonts=[]
for family,weight,name in [('Noto Sans JP',500,'noto-sans-jp-japanese-500-normal.woff2'),('Noto Serif JP',700,'noto-serif-jp-japanese-700-normal.woff2')]:
 data=base64.b64encode((ROOT/'fonts'/name).read_bytes()).decode();fonts.append(f"@font-face{{font-family:'{family}';font-weight:{weight};src:url(data:font/woff2;base64,{data}) format('woff2');}}")
colors=spec['colors']; parts=[]
def text(s,x,y,size=42,family='Noto Sans JP',color=None,weight=500):
 parts.append(f'<text x="{x}" y="{y}" font-family="{family}" font-weight="{weight}" font-size="{size}" fill="{color or colors["ink"]}" dominant-baseline="hanging">{html.escape(s)}</text>')
def rect(x,y,w,h,fill,rx=0):parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"/>')
def img(i,x,y,w,h):
 data,pw,ph=photos[i]
 ident=f'clip{len(parts)}';parts.append(f'<defs><clipPath id="{ident}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16"/></clipPath></defs><g clip-path="url(#{ident})"><svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="0 0 {pw} {ph}" preserveAspectRatio="xMidYMid slice"><image width="{pw}" height="{ph}" href="data:image/png;base64,{data}"/></svg></g>')

def heading(lines,y=152,size=76):
 for j,line in enumerate(lines):text(line,72,y+j*size*1.2,size,'Noto Serif JP',weight=700)
def action(n,title,body,y):
 text(f'{n:02d}',72,y,42,color=colors['accent']);text(title,160,y,42);text(body,160,y+66,42)
def leaf(x,y):parts.append(f'<g transform="translate({x} {y})"><path d="M0 60 Q20 0 74 0 Q80 54 0 60Z" fill="{colors["ochre"]}"/><path d="M0 60 L58 16" stroke="{colors["accent"]}" stroke-width="3"/></g>')
alts=[]
for slide in spec['slides']:
 ident=slide['id'];h=1080 if ident=='B01' else 1350;parts=[]
 rect(0,0,1080,h,colors['surface']);text('秋じかん',72,72,36,'Noto Serif JP',weight=700);text('架空ブランド・自主制作',540,72,36,color=colors['forest'])
 if ident=='P01':
  heading(['この秋、','何しよう？'],184,96);text('週末が楽しみになる、',72,440);text('8つの小さなアイデア',72,505)
  img(1,72,624,448,592);img(3,544,624,464,280);img(4,544,928,464,288)
 elif ident=='P02':
  heading([slide['title']]);img(2,72,312,336,360);img(1,72,784,336,360)
  text('01',456,344,42,color=colors['accent']);text('ブラウンネイルを',456,416);text('楽しむ',456,482);text('まずは一色、',456,564);text('気分を変えて。',456,630)
  text('02',456,816,42,color=colors['accent']);text('秋服で出かける',456,888);text('手持ちの服に、',456,972);text('茶色をひとつ。',456,1038)
 elif ident=='P03':
  heading(['いつもの道に、','秋を探す。']);img(3,72,376,936,528);action(3,'いちょう並木を散歩','近くの公園で、ゆっくり歩こう。',960);action(4,'紅葉を撮りに行く','好きな色を、一枚に残そう。',1104)
 elif ident=='P04':
  heading(['おいしい秋に、','寄り道。']);img(4,72,376,936,528);action(5,'季節のカフェ・スイーツ','秋メニューを探して、ひと休み。',960);action(6,'栗・さつまいも・かぼちゃ','気になる秋の味を、ひとつ選ぼう。',1104)
 elif ident=='P05':
  heading([slide['title']]);img(5,72,304,936,600);action(7,'秋のピクニック','飲み物と一冊を持って、公園へ。',960);action(8,'秋のひとり旅','行きたい街を、地図で探してみよう。',1104)
 elif ident=='P06':
  heading(['この週末、','ひとつ選ぼう。']);leaf(908,354)
  for j,line in enumerate(['秋色を楽しむ','散歩する','秋の味を楽しむ','小さな旅へ']):
   y=472+j*144;rect(72,y,48,48,'none',4);parts.append(f'<rect x="72" y="{y}" width="48" height="48" rx="4" fill="none" stroke="{colors["forest"]}" stroke-width="4"/>');text(line,160,y,48);rect(160,y+84,848,2,colors['line'])
  rect(72,1080,936,136,colors['forest'],16);text('あとで見返せるように、',112,1100,42,color=colors['surface']);text('保存してね。',112,1165,42,color=colors['surface'])
 else:
  heading(['週末に、','秋をひとつ。'],160);img(4,72,380,448,432)
  text('装う・歩く・',560,400);text('味わう・旅する',560,470);text('この秋に',560,580);text('やりたいこと',560,646);text('8選',560,726,76,'Noto Serif JP',weight=700)
  rect(72,856,936,104,colors['forest'],16);text('あとで見返せるように保存',112,886,42,color=colors['surface'])
 text('自主制作｜秋のアイデア集',72,h-116,36,color=colors['forest']);text('1 banner' if ident=='B01' else f'{int(ident[1:])}/6',824,h-116,36,color=colors['forest'])
 alt=slide['title']+' '+slide['text'].replace('／','。').replace('\n','。')+'。秋じかん、架空ブランドの自主制作。'
 while '。。' in alt: alt=alt.replace('。。','。')
 alts.append({'id':ident,'copy':slide,'alt':alt})
 out=f'<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="{h}" viewBox="0 0 1080 {h}" role="img"><title>{html.escape(slide["title"])}</title><desc>{html.escape(alt)}</desc><style>{"".join(fonts)}</style>{"".join(parts)}</svg>'
 (ROOT/'06-delivery'/f'{ident}.svg').write_text(out)
(ROOT/'06-delivery/copy-and-alt.json').write_text(json.dumps(alts,ensure_ascii=False,indent=2))
print('Composed seven SVGs with embedded original photo and fonts.')
