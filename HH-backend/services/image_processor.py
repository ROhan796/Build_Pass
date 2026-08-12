import io
from PIL import Image, ImageDraw, ImageFont

TITLE_MAP = {
    "frontend": "Pixel Whisperer 🎨",
    "react": "Component Architect 🧱",
    "vue": "Vue Voyager ⚡",
    "backend": "Backend Barbarian ⚔️",
    "full stack": "Fullstack Sorcerer 🧙",
    "fullstack": "Fullstack Sorcerer 🧙",
    "ai": "Gradient Descender 📉",
    "ml": "Loss Minimizer 🧮",
    "llm": "Token Economist 🪙",
    "devops": "Cloud Shepherd ☁️",
    "platform": "Infra Overlord 🏗️",
    "ios": "Swift Samurai 🗡️",
    "android": "Kotlin Conjurer 🔮",
    "design": "UX Visionary ✨",
    "product": "Roadmap Oracle 🗺️",
    "data": "Data Druid 🌲",
    "security": "Bug Slayer 🐛",
    "blockchain": "Chain Maximalist ⛓️",
    "web3": "Degen Deployed 🎲",
    "founder": "Ship or Die Captain 🚢",
    "growth": "Retention Wizard 📈",
    "dx": "Developer Whisperer 🎙️",
    "solidity": "EVM Enchanter 🔮",
    "rust": "Borrow Checker Slayer 🦀",
    "python": "Bytecode Wrangler 🐍",
}

THEME_ACCENTS = {
    "cyan_surf": {"main": "#c5a059", "secondary": "#f0db9e", "dark": "#1c160b", "glow": "#c5a059"},
    "ember_bonfire": {"main": "#d4af37", "secondary": "#f0db9e", "dark": "#1f1a08", "glow": "#d4af37"},
    "sand_dunes": {"main": "#e8c97a", "secondary": "#c9985a", "dark": "#221b0a", "glow": "#e8c97a"},
    "neon_palm": {"main": "#b89756", "secondary": "#e6ca85", "dark": "#18140a", "glow": "#b89756"},
}


def generate_builder_title(role: str = "") -> str:
    lower = role.lower().strip()
    if not lower:
        return "Builder Extraordinaire 🚀"
    for key, title in TITLE_MAP.items():
        if key in lower:
            return title
    if any(w in lower for w in ("lead", "head", "cto")):
        return "Tech Maestro 🎯"
    return "Hacker Extraordinaire 🚀"


def _hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def _load_font(size: int):
    font_paths = [
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in font_paths:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def smart_crop_to_square(img: Image.Image) -> Image.Image:
    w, h = img.size
    size = min(w, h)
    left = (w - size) // 2
    top = max(0, (h - size) // 3)
    return img.crop((left, top, left + size, top + size))


def composite_frame_a(user_photo_bytes: bytes) -> bytes:
    photo = Image.open(io.BytesIO(user_photo_bytes)).convert("RGBA")
    canvas = Image.new("RGBA", (1080, 1080), (10, 10, 10, 255))

    photo = smart_crop_to_square(photo).resize((1080, 1080), Image.Resampling.LANCZOS)
    canvas.paste(photo, (0, 0))

    draw = ImageDraw.Draw(canvas)
    theme = THEME_ACCENTS["cyan_surf"]
    main_rgb = _hex_to_rgb(theme["main"])

    draw.rounded_rectangle(
        [(50, 50), (1030, 1030)],
        radius=48,
        outline=main_rgb,
        width=16,
    )
    draw.rounded_rectangle(
        [(76, 76), (1004, 1004)],
        radius=36,
        outline=(255, 255, 255, 38),
        width=2,
    )

    font_title = _load_font(24)
    banner_text = "🏄\u200d♂️ HH GOA 2026 · HACKER"
    bbox = draw.textbbox((0, 0), banner_text, font=font_title)
    tw = bbox[2] - bbox[0]
    bx = (1080 - tw - 60) // 2
    draw.rounded_rectangle(
        [(bx, 32), (bx + tw + 60, 100)],
        radius=34,
        fill=(6, 10, 18, 230),
        outline=main_rgb,
        width=2,
    )
    draw.text(
        ((1080 - tw) // 2, 45),
        banner_text,
        fill=main_rgb,
        font=font_title,
    )

    font_name = _load_font(36)
    font_sub = _load_font(20)

    bottom_y = 900
    draw.rounded_rectangle(
        [(130, bottom_y), (950, bottom_y + 120)],
        radius=24,
        fill=(18, 18, 18, 230),
        outline=main_rgb,
        width=2,
    )
    draw.text(
        (540, bottom_y + 22),
        "HH GOA BUILDER",
        fill=(255, 255, 255),
        font=font_name,
        anchor="mt",
    )
    draw.text(
        (540, bottom_y + 72),
        "Hacker Extraordinaire 🚀",
        fill=main_rgb,
        font=font_sub,
        anchor="mt",
    )

    buf = io.BytesIO()
    canvas.convert("RGB").save(buf, format="PNG", optimize=True, quality=85)
    return buf.getvalue()


def composite_card_b(
    user_photo_bytes: bytes,
    name: str,
    role: str,
    title: str = "",
    handle: str = "",
    theme_name: str = "cyan_surf",
    card_no: int = 1024,
) -> bytes:
    photo = Image.open(io.BytesIO(user_photo_bytes)).convert("RGBA")
    card = Image.new("RGBA", (1080, 1350), (10, 10, 10, 255))

    theme = THEME_ACCENTS.get(theme_name, THEME_ACCENTS["cyan_surf"])
    main_rgb = _hex_to_rgb(theme["main"])

    draw = ImageDraw.Draw(card)

    draw.rounded_rectangle(
        [(30, 30), (1050, 1320)],
        radius=36,
        outline=main_rgb,
        width=12,
    )

    draw.rounded_rectangle(
        [(50, 50), (1030, 140)],
        radius=20,
        fill=(18, 18, 18, 255),
    )

    font_header = _load_font(32)
    font_badge = _load_font(16)
    draw.text((80, 72), "HH GOA 2026", fill=(255, 255, 255), font=font_header)
    draw.text((1000, 78), "BUILDER PASS", fill=main_rgb, font=font_badge, anchor="ra")

    photo_box = (60, 160, 1020, 840)
    photo_resized = smart_crop_to_square(photo).resize(
        (photo_box[2] - photo_box[0], photo_box[3] - photo_box[1]),
        Image.Resampling.LANCZOS,
    )
    photo_mask = Image.new("L", photo_resized.size, 0)
    mask_draw = ImageDraw.Draw(photo_mask)
    mask_draw.rounded_rectangle(
        [(0, 0), photo_resized.size],
        radius=28,
        fill=255,
    )
    card.paste(photo_resized, (photo_box[0], photo_box[1]), photo_mask)

    info_y = 860
    draw.rounded_rectangle(
        [(60, info_y), (1020, info_y + 410)],
        radius=24,
        fill=(18, 18, 18, 255),
        outline=main_rgb,
        width=2,
    )

    font_name = _load_font(48)
    font_role = _load_font(24)
    font_title = _load_font(20)
    font_meta = _load_font(16)
    font_card_no = _load_font(24)

    draw.text((100, info_y + 68), name.upper(), fill=(255, 255, 255), font=font_name)
    draw.text((100, info_y + 124), role, fill=(123, 158, 201), font=font_role)

    title_display = title or "Builder Extraordinaire 🚀"
    draw.rounded_rectangle(
        [(100, info_y + 160), (100 + len(title_display) * 14 + 36, info_y + 208)],
        radius=24,
        fill=_hex_to_rgb(theme["dark"]),
        outline=main_rgb,
        width=2,
    )
    draw.text((118, info_y + 172), title_display, fill=main_rgb, font=font_title)

    if handle:
        draw.text((100, info_y + 230), f"𝕏 {handle}", fill=(123, 158, 201), font=font_title)

    draw.line([(100, info_y + 260), (980, info_y + 260)], fill=(255, 255, 255, 25), width=1)

    draw.text((100, info_y + 300), "EVENT: GOA, INDIA · JUNE 2026", fill=(123, 158, 201), font=font_meta)
    draw.text((100, info_y + 330), "STATUS: CONFIRMED HACKER", fill=(123, 158, 201), font=font_meta)

    card_no_str = f"#{card_no:04d}"
    draw.text((980, info_y + 320), card_no_str, fill=main_rgb, font=font_card_no, anchor="ra")

    qr_x, qr_y, qr_size = 900, info_y + 60, 100
    draw.rounded_rectangle(
        [(qr_x, qr_y), (qr_x + qr_size, qr_y + qr_size)],
        radius=12,
        fill=(6, 10, 18, 255),
        outline=main_rgb,
        width=1,
    )
    for i in range(5):
        for j in range(5):
            if (i + j) % 2 == 0 or (i * j) % 3 == 0:
                draw.rectangle(
                    [
                        (qr_x + 10 + i * 16, qr_y + 10 + j * 16),
                        (qr_x + 10 + i * 16 + 12, qr_y + 10 + j * 16 + 12),
                    ],
                    fill=main_rgb,
                )

    buf = io.BytesIO()
    card.convert("RGB").save(buf, format="PNG", optimize=True, quality=85)
    return buf.getvalue()
