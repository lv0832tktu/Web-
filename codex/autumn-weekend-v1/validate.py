"""Validate exported static artwork, hashes, copy, text bounds and contrast."""
from pathlib import Path
import json,hashlib,re,xml.etree.ElementTree as ET
from PIL import Image
R=Path(__file__).resolve().parent
spec=json.loads((R/'design-spec.json').read_text()); result=[]
for slide in spec['slides']:
 ident=slide['id'];root=ET.parse(R/'06-delivery'/f'{ident}.svg').getroot();ns={'s':'http://www.w3.org/2000/svg'}
 texts=[''.join(e.itertext()) for e in root.findall('.//s:text',ns)];actual=''.join(texts)
 expected=slide['title']+slide['text']
 normal=lambda s:re.sub(r'[\s／□]','',s)
 assert normal(expected) in normal(actual), (ident,normal(expected),normal(actual))
 assert len(root.findall('.//s:animate',ns))==0
 with Image.open(R/'06-delivery'/f'{ident}.png') as im:
  assert im.size==(1080,1080 if ident=='B01' else 1350);assert im.format=='PNG';assert im.mode in ['RGB','RGBA'];mode=im.mode
 assert (R/'06-delivery'/f'{ident}.png').read_bytes()==(R/'evidence'/f'{ident}-native-final.png').read_bytes()
 assert root.findall('.//s:text',ns)
 assert all(float(e.attrib['font-size'])>=42 for e in root.findall('.//s:text',ns) if not any(label in ''.join(e.itertext()) for label in ['秋じかん','自主制作','/6','banner']))
 result.append({'id':ident,'dimensions':[1080,1080 if ident=='B01' else 1350],'copy':'PASS','reexportBytes':'PASS','mode':mode})
assert all(not e['outOfSafeArea'] for e in json.loads((R/'evidence/text-bounds.json').read_text()))
def luminance(hex):
 v=[int(hex[i:i+2],16)/255 for i in [1,3,5]];v=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in v];return sum(a*b for a,b in zip(v,[.2126,.7152,.0722]))
ratios={}
for role in ['ink','accent','forest']:
 a,b=sorted([luminance(spec['colors'][role]),luminance(spec['colors']['surface'])]);ratio=(b+.05)/(a+.05);assert ratio>=4.5;ratios[role]=ratio
hashes={str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((R/'06-delivery').glob('*')) if p.suffix in ['.svg','.png']}
(R/'evidence/static-validation.json').write_text(json.dumps({'artwork':result,'contrastOnSurface':ratios,'safeArea':'PASS','sha256':hashes},ensure_ascii=False,indent=2))
print('PASS: 7 dimensions, full visible copy, editable text, static output, exact re-export match, safe area, contrast.')
