import asyncio, os, base64
from playwright.async_api import async_playwright
OUT = os.path.expanduser('~/repos/omegs/store')
SCREENS = [
  ('01-home', '/', 0, 'Professional cleaning,<br>booked in minutes'),
  ('02-services', '/services', 380, 'Home, office and<br>specialist cleaning'),
  ('03-detail', '/services/deep-cleaning', 0, "See exactly what's<br>included"),
  ('04-home-more', '/', 1100, 'Trusted local cleaners<br>in Nottingham'),
  ('05-contact', '/contact', 0, 'Book or chat with us<br>on WhatsApp'),
  ('06-login', '/login', 0, 'One account for all<br>your bookings'),
]
# (folder, canvas w, h, raw viewport w, h, dpr)
TARGETS = [('iphone-6.9', 1320, 2868), ('android-phone', 1080, 1920)]
def page_html(w, h, headline, img):
    s = w / 1320
    fh = round((100 if h / w > 1.9 else 94) * s)
    top = round(h * 0.075)
    phone_w = round(w * (0.78 if h / w > 1.9 else 0.62))
    return f"""<html><head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap" rel="stylesheet">
<style>html,body{{margin:0;width:{w}px;height:{h}px;overflow:hidden;background:radial-gradient(circle at 20% 10%,#1f3d5c 0,#12233a 55%);font-family:Inter,sans-serif}}
h1{{color:#fff;text-align:center;font-weight:800;font-size:{fh}px;line-height:1.12;margin:{top}px 40px 0;letter-spacing:-0.02em}}
h1 span{{color:#4fc199}}
.phone{{position:absolute;left:50%;transform:translateX(-50%);top:{top + fh*2.6 + 40*s:.0f}px;width:{phone_w}px;border-radius:{70*s:.0f}px;border:{18*s:.0f}px solid #0b1626;overflow:hidden;box-shadow:0 {40*s:.0f}px {120*s:.0f}px rgba(0,0,0,.45);background:#fff}}
.phone img{{display:block;width:100%}}</style></head>
<body><h1>{headline}</h1><div class="phone"><img src="data:image/png;base64,{img}"></div></body></html>"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.connect_over_cdp('http://localhost:29229')
        raw_ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        pg = await raw_ctx.new_page()
        raws = {}
        for name, path, scroll, _ in SCREENS:
            await pg.goto('http://localhost:4174' + path, wait_until='networkidle')
            await pg.wait_for_timeout(1500)
            if scroll: await pg.evaluate(f'window.scrollTo(0,{scroll})'); await pg.wait_for_timeout(800)
            f = f'{OUT}/screenshots/raw/{name}.png'
            await pg.screenshot(path=f)
            raws[name] = base64.b64encode(open(f, 'rb').read()).decode()
        await raw_ctx.close()
        for folder, w, h in TARGETS:
            ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
            cp = await ctx.new_page()
            for name, _, _, headline in SCREENS:
                hl = headline.replace('<br>', '<br><span>', 1) + '</span>'
                await cp.set_content(page_html(w, h, hl, raws[name]), wait_until='networkidle')
                await cp.wait_for_timeout(300)
                await cp.screenshot(path=f'{OUT}/screenshots/{folder}/{name}.png')
            await ctx.close()
        ctx = await b.new_context(viewport={'width': 1024, 'height': 500}, device_scale_factor=1)
        cp = await ctx.new_page()
        icon = base64.b64encode(open(os.path.expanduser('~/repos/omegs/resources/icon-1024.png'), 'rb').read()).decode()
        await cp.set_content(f"""<html><head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;800&display=swap" rel="stylesheet"><style>
body{{margin:0;width:1024px;height:500px;background:radial-gradient(circle at 15% 20%,#1f3d5c 0,#12233a 60%);font-family:Inter,sans-serif;display:flex;align-items:center;gap:48px;padding:0 80px;box-sizing:border-box;color:#fff}}
img{{width:200px;height:200px;border-radius:44px}} h1{{font-size:72px;font-weight:800;margin:0;letter-spacing:-0.02em}} h1 span{{color:#4fc199}} p{{font-size:30px;color:#c3d4e1;margin:16px 0 0;font-weight:500}}</style></head>
<body><img src="data:image/png;base64,{icon}"><div><h1>omegs<span>.</span></h1><p>A cleaner space. A better day.<br>Book home &amp; office cleaning in minutes.</p></div></body></html>""", wait_until='networkidle')
        await cp.wait_for_timeout(300)
        await cp.screenshot(path=f'{OUT}/graphics/play-feature-graphic-1024x500.png')
        await ctx.close()
asyncio.run(main())
