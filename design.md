# Design System — Héctor Lacorte

## Tokens

## Color Palette
| Role      | Name      | Hex       |
|-----------|-----------|-----------|
| Primary   | Gold      | #C9A84C   |
| Secondary | Dark Grey | #3A3A3A   |
| Tertiary  | Off-White | #F5F0EB   |
| Neutral   | Black     | #0A0A0A   |

## Typography
| Role     | Font           |
|----------|----------------|
| Headline | Space Grotesk  |
| Body     | Manrope        |
| Label    | Manrope        |

## Button Variants
- Primary (gold fill)
- Secondary (dark fill)
- Inverted (light fill)
- Outlined (border only)

## Navigation
- Mobile bottom nav bar with icons: Home, Search, Profile
- Search bar component included

## Icon Style
- Rounded, minimal
- Actions: Edit, Duplicate, Tag, Delete

## Design Principles
- Dark background base (#0A0A0A)
- Gold (#C9A84C) as accent and CTA color
- Off-white (#F5F0EB) for text on dark backgrounds
- Sharp, modern, minimalist — no gradients, no shadows

---

## Home
<!DOCTYPE html>

<html class="dark" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=Manrope:wght@200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-primary-fixed": "#241a00",
                        "tertiary-container": "#afaba7",
                        "surface-container-low": "#1c1b1b",
                        "on-tertiary": "#32302d",
                        "on-secondary-fixed": "#1b1c1c",
                        "secondary": "#c8c6c6",
                        "on-tertiary-fixed": "#1d1b19",
                        "on-surface": "#e5e2e1",
                        "error": "#ffb4ab",
                        "error-container": "#93000a",
                        "surface-bright": "#3a3939",
                        "surface": "#131313",
                        "surface-variant": "#353534",
                        "on-primary-fixed-variant": "#584400",
                        "outline-variant": "#4d4637",
                        "on-primary": "#3d2e00",
                        "on-error-container": "#ffdad6",
                        "primary-container": "#c9a84c",
                        "background": "#131313",
                        "primary-fixed": "#ffe08f",
                        "on-surface-variant": "#d0c5b2",
                        "inverse-on-surface": "#313030",
                        "secondary-fixed": "#e4e2e1",
                        "inverse-surface": "#e5e2e1",
                        "surface-container": "#201f1f",
                        "tertiary-fixed": "#e6e2dd",
                        "outline": "#99907e",
                        "on-primary-container": "#503d00",
                        "surface-container-high": "#2a2a2a",
                        "primary": "#e6c364",
                        "on-tertiary-container": "#41403c",
                        "secondary-container": "#474747",
                        "surface-container-lowest": "#0e0e0e",
                        "tertiary": "#cac6c2",
                        "primary-fixed-dim": "#e6c364",
                        "surface-tint": "#e6c364",
                        "on-background": "#e5e2e1",
                        "surface-dim": "#131313",
                        "on-tertiary-fixed-variant": "#484643",
                        "on-secondary-fixed-variant": "#474747",
                        "on-secondary": "#303030",
                        "tertiary-fixed-dim": "#cac6c1",
                        "surface-container-highest": "#353534",
                        "on-secondary-container": "#b6b5b4",
                        "inverse-primary": "#755b00",
                        "secondary-fixed-dim": "#c8c6c6",
                        "on-error": "#690005"
                    },
                    "borderRadius": {
                        "DEFAULT": "0px",
                        "lg": "0px",
                        "xl": "0px",
                        "full": "9999px"
                    },
                    "fontFamily": {
                        "headline": ["Space Grotesk"],
                        "body": ["Manrope"],
                        "label": ["Manrope"]
                    }
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
        body {
            background-color: #131313;
            color: #e5e2e1;
        }
    </style>
</head>
<body class="font-body selection:bg-primary-container selection:text-on-primary-container">
<!-- TopNavBar -->
<nav class="bg-[#131313] dark:bg-[#131313] flex justify-between items-center w-full px-8 py-6 max-w-full mx-auto fixed top-0 z-50">
<div class="flex items-center gap-4">
<img alt="Logo" class="h-10 w-auto" data-alt="Minimalist blackletter typography logo for a high-end luxury barbershop, crisp white lines on dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-yw0MqGUz9_ZBGatl847ZJBN-KwLlk6ganOF0kFPjUFfM5HG3KDf4RGNf6nivr-2jN1cuKbqTh7Sq4e50mIPmhukoHw_8cmGTAX_HI6XDTw0iHfIY-MmmX31mvlpD9lU16E-ABOBHak9AoEAez4oRPPZhdQr_yTuEr8msdsGpzB2T8JfLhk_Lag3BSDWCqdry08ehmd8Zjx82U--N8CmJu4cikn9w_PxsT5t5SNepscVxUY-FU8pi5GjVuW4MoEq-1jnWzafTb3I"/>
<span class="text-2xl font-black tracking-tighter text-[#E5E2E1] font-headline">Héctor Lacorte</span>
</div>
<div class="hidden md:flex items-center space-x-12">
<a class="text-[#E6C364] border-b-2 border-[#E6C364] pb-1 font-headline uppercase tracking-widest text-xs transition-all duration-200" href="#services">Services</a>
<a class="text-[#E5E2E1] hover:text-[#C9A84C] transition-colors duration-300 font-headline uppercase tracking-widest text-xs" href="#gallery">Gallery</a>
<a class="text-[#E5E2E1] hover:text-[#C9A84C] transition-colors duration-300 font-headline uppercase tracking-widest text-xs" href="#about">About</a>
</div>
<button class="bg-[#E6C364] text-[#3D2E00] px-8 py-3 font-headline font-bold uppercase tracking-wider hover:bg-[#C9A84C] active:scale-[0.98] transition-all duration-200">
            Reservar cita
        </button>
</nav>
<main>
<!-- Hero Section -->
<section class="relative h-screen w-full flex items-center justify-center overflow-hidden bg-surface-container-lowest">
<div class="absolute inset-0 z-0">
<div class="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent z-10"></div>
<img alt="Atmospheric barbershop interior" class="w-full h-full object-cover opacity-60" data-alt="Cinematic wide shot of a luxury barbershop interior with dark leather chairs, atmospheric moody lighting, and soft smoke or mist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdWgLxmqWroxxwaI5S60JntvfwDlsjJb_oVzReTOR6ujTEKCDuJI_bPaGmGKQ-KheHPrOj_351iy62HiW07A-0-xZaA6O_yxLJnTX1nxHWa3F3LU3mpU8QWJpe4nC7PhTBBx03jMnKPMhVt_4voVhwRBdDKDKLVSx8oPLQxeuDtB_RPDb1T44zfG6BMxJkTmhm6IcfV88niG2Dgi64xRuRGbAh62XJrlreB9QvfI04_F9NQzf21sUqjpY-I8Yncxzdwg9Sty9CEEo"/>
</div>
<div class="relative z-20 text-center px-4">
<h1 class="font-headline text-[12vw] leading-none font-bold tracking-tighter text-on-surface mb-6 select-none">
                    Héctor Lacorte
                </h1>
<p class="font-headline text-xl md:text-3xl font-light tracking-[0.3em] text-primary uppercase mb-12">
                    El corte perfecto. Solo para caballeros.
                </p>
<div class="flex flex-col md:flex-row gap-6 justify-center items-center">
<button class="w-full md:w-auto bg-primary text-on-primary px-12 py-5 font-headline font-bold uppercase tracking-[0.2em] hover:bg-primary-container transition-all active:scale-[0.98]">
                        Reservar cita
                    </button>
<a class="w-full md:w-auto px-12 py-5 border border-outline/30 font-headline font-bold uppercase tracking-[0.2em] text-on-surface hover:bg-surface-bright transition-all" href="#services">
                        Servicios
                    </a>
</div>
</div>
</section>
<!-- Services Section: The Service Slot -->
<section class="py-32 bg-surface px-8 md:px-24" id="services">
<div class="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
<div class="max-w-2xl">
<span class="text-primary font-headline tracking-[0.4em] uppercase text-sm mb-4 block">Maestría y Precisión</span>
<h2 class="text-6xl font-headline font-bold tracking-tight text-on-surface">Servicios</h2>
</div>
<p class="text-outline max-w-sm font-light leading-relaxed">
                    Cada corte es una declaración de identidad. Utilizamos técnicas clásicas con una visión arquitectónica moderna.
                </p>
</div>
<div class="grid grid-cols-1 gap-px bg-outline/10">
<!-- Service 1 -->
<div class="group relative flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest p-12 hover:bg-surface-container transition-colors duration-500">
<div class="flex flex-col gap-2">
<h3 class="text-3xl font-headline font-bold text-on-surface">Corte &amp; Asesoramiento</h3>
<div class="flex items-center gap-4">
<span class="flex items-center gap-2 text-outline text-xs uppercase tracking-widest font-bold">
<span class="material-symbols-outlined text-sm">schedule</span> 30 min
                            </span>
</div>
</div>
<div class="flex items-center gap-12 mt-8 md:mt-0">
<span class="text-5xl font-headline font-bold text-primary">12€</span>
<button class="bg-surface-bright text-on-surface px-6 py-3 font-headline font-bold uppercase text-xs tracking-widest group-hover:bg-primary group-hover:text-on-primary transition-all">
                            Reservar
                        </button>
</div>
</div>
<!-- Service 2 -->
<div class="group relative flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest p-12 hover:bg-surface-container transition-colors duration-500">
<div class="flex flex-col gap-2">
<h3 class="text-3xl font-headline font-bold text-on-surface">Corte (Lunes y Martes)</h3>
<div class="flex items-center gap-4">
<span class="flex items-center gap-2 text-outline text-xs uppercase tracking-widest font-bold">
<span class="material-symbols-outlined text-sm">schedule</span> 30 min
                            </span>
<span class="bg-primary/10 text-primary px-3 py-1 text-[10px] uppercase font-bold tracking-tighter">Oferta semanal</span>
</div>
</div>
<div class="flex items-center gap-12 mt-8 md:mt-0">
<span class="text-5xl font-headline font-bold text-primary">10€</span>
<button class="bg-surface-bright text-on-surface px-6 py-3 font-headline font-bold uppercase text-xs tracking-widest group-hover:bg-primary group-hover:text-on-primary transition-all">
                            Reservar
                        </button>
</div>
</div>
<!-- Service 3 -->
<div class="group relative flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest p-12 hover:bg-surface-container transition-colors duration-500">
<div class="flex flex-col gap-2">
<h3 class="text-3xl font-headline font-bold text-on-surface">Corte + Barba</h3>
<div class="flex items-center gap-4">
<span class="flex items-center gap-2 text-outline text-xs uppercase tracking-widest font-bold">
<span class="material-symbols-outlined text-sm">schedule</span> 35 min
                            </span>
</div>
</div>
<div class="flex items-center gap-12 mt-8 md:mt-0">
<span class="text-5xl font-headline font-bold text-primary">15€</span>
<button class="bg-surface-bright text-on-surface px-6 py-3 font-headline font-bold uppercase text-xs tracking-widest group-hover:bg-primary group-hover:text-on-primary transition-all">
                            Reservar
                        </button>
</div>
</div>
<!-- Service 4 -->
<div class="group relative flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest p-12 hover:bg-surface-container transition-colors duration-500">
<div class="flex flex-col gap-2">
<h3 class="text-3xl font-headline font-bold text-on-surface">Corte VIP</h3>
<p class="text-outline text-sm font-light">Corte, barba, asesoramiento y cejas</p>
<div class="flex items-center gap-4">
<span class="flex items-center gap-2 text-outline text-xs uppercase tracking-widest font-bold">
<span class="material-symbols-outlined text-sm">schedule</span> 40 min
                            </span>
</div>
</div>
<div class="flex items-center gap-12 mt-8 md:mt-0">
<span class="text-5xl font-headline font-bold text-primary">18€</span>
<button class="bg-surface-bright text-on-surface px-6 py-3 font-headline font-bold uppercase text-xs tracking-widest group-hover:bg-primary group-hover:text-on-primary transition-all">
                            Reservar
                        </button>
</div>
</div>
</div>
</section>
<!-- Gallery Section -->
<section class="py-32 bg-surface-container-lowest" id="gallery">
<div class="px-8 md:px-24 mb-16">
<h2 class="text-5xl font-headline font-bold tracking-tight text-on-surface mb-4">Nuestros Cortes</h2>
<div class="h-1 w-24 bg-primary"></div>
</div>
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
<div class="space-y-4">
<img alt="Portfolio cut 1" class="w-full aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Close up of a clean skin fade haircut with sharp line-up on a young man, professional studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjuF6vPWzWMiIPjBPJlqG39wCvwhVQ5JjslIwtpHv-Fav_6pcSksS7bcKopvqErK3e1sgcPx1WwnOJQhTdm9daU6wD3gRPv3aPqdNBvd0QQv7ahBtdSpQiTarVOFDxzqe-HZVGzAmjxJ3CyagwrvBoToTmkfBEJOXKMZunlMV0yO_RbVQgwp25BsvnjiFOOLLh5Ney32TkkyZD6Cpoxltg7Ru521JIZJjdHSP2jV-0lUqP27CRSacLAqjgpOEJgW2GFzSBMuI0BcA"/>
<img alt="Portfolio cut 2" class="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Side profile of a man with a well-groomed beard and a pompadour hairstyle in a barber chair" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcUSTUbmV08aH1OQqPnHqx3GlYKWGUWiFxw7ld2JAKCLhQZRQ8tinqZIJqP0jAOSCtDgVIXTHuHbdh6UK0jvQ_Hm-kI0wb4Peb9vhc0HMA-73mQzkMq7RUeHUFAfhUJljyclFoiSf2KJ_RArJXGgzdsFe7WYXWlsJhgHCdSiffAJkoA1oNfeAHSaxLo2OOjGqzP8AzxgTCcRSW78XCcRaGo4MbVWnZq-qRhwUuoowCBUIzRYDfLgr031_KcHirGcEtGM_tCfVsl1g"/>
</div>
<div class="space-y-4 pt-12">
<img alt="Portfolio cut 3" class="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Barber using a straight razor for a traditional wet shave with white shaving cream on a client" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDerpKW61L7_G9_pRQfkifGDZUdHkpKbI5pdJ-exhK0Gf01pYuATf_ks9MFxvGK_qq5vEqgV5zx1Il4-Nq4h_czFlekJ9wmi5-uFw7us9h3U4EG7oB6vIrEHCrDNYgsv6X0CgVB4T6fvC_5LbmPUGIV1bRFMxqrkgejpIFRc3VFEqhbX-u0oFGGDt3x7FqXJ4p3ZsWqbBKucHKC1pjw-tnAZQn2E9dbyYgueJ2kUouBdplXL4PH05eWMHyy6WiWR6seyO8WxxKfxHE"/>
<img alt="Portfolio cut 4" class="w-full aspect-[3/5] object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Top view of a barber finishing a textured crop haircut on a dark-haired male client" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPGW13XwBCeh8gOsJ3INK-oDIwR7AHDjihKfCo4VbRiXbBH4kuTO6_UzR5BppGjmLL2Bdfn1x9an1_Gx4O1deoYwa07hDa_kw0NOn1Mh9PipSvOIF3XS_jaDffQRyoZKircVsO9KpUe3x0Z5eXWisE4SS2eQL9zGZSK6-ClpQJIFM5CF-7OM-mn8FGdcHBe4vqg7dZMZ72tRIx3muKacZhFl35756AVdeA4cfYnrCncPR1W4LRCDEHe9Eoqum2cto6V3F0mguzUHw"/>
</div>
<div class="space-y-4">
<img alt="Portfolio cut 5" class="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Detailed shot of a silver hair clipper being used on a man's sideburn with precision" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGi0Kz_DI_9cXB9pCO0mM_6aQQyIYe8V4HoDYBoCsOseGW3e1D3uM4rrhktSoOZttluv3AMrcR4S2psI4Z44k0N_v0D521UlhMbqYVgSFV75NdTpSyWxDAUPhCuUVfgSdUJflAuIFZ-r9DDspNMmNXwDeKskgd5SbXKbIANlnlStuPsGQzySvW0vJpzFTrXGhePcmsbQlQm9g6kHEJ3hVGqfaPp5_w9eDIP6EMTz_cVZx89tJqlnCcsXfQKcCUZ6uNX4JitPYrmiI"/>
<img alt="Portfolio cut 6" class="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Portrait of a smiling man with a modern buzz cut and a short beard, wearing a black t-shirt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCri4a7RtOFpdLEk5owzyxctafP2rC44aJenpSWyN79JwtOxMGvE1vMs1o5lM8tylqdhI6G0nAqZkSVplPL8eRF5N4pDACK88YSza5ue2Un3RUvDJE5q9yxXFDTdg3zpQiIYhvC28msQeJyZNKxexMQ2Yf0dhdQ1VKBEJMX10f-sWeRNH__phkhg58Ow4XlKJYU0VI79ZKs-ydFEBY0GKUkAcOuARaIsMeal4260Z6hIoRFYsDVhyzrSTZuNSxwfaxRmlW5JpmnTqw"/>
</div>
<div class="space-y-4 pt-8">
<img alt="Portfolio cut 7" class="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Close up of a tapered haircut on the back of a man's neck with intricate hair design carved in" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdoGa1gXXRshZzyq1ysjTyvX6Ua3Jo4f54xHzsA5fh92lsFWojU4CWABdsAH7nUeap9glM1Ke3XTFe5CKgkDXNxwyKvY80m5hQoN5C-p1qhaiV2m3QtAV2ZJZEj9fGwoLtvt03pfUjbfBHolbbEemWpXBOBEn5OeHZl9YaZhmbu8XDsdUXavCuX8RulKQ57D7gCc3ixUnTIlGbvT09lE08UVdwfmI7pJmSnqX8rVnWZM6V85s13iuKln8bS24x_b1DqKhc90kSi6U"/>
<img alt="Portfolio cut 8" class="w-full aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Action shot of water being sprayed from a black glass bottle onto a client's hair" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhFmR3aXLEaQRoWcf_L_6_2r-tlGnUxSI5u2rhiriRvz1THSTt_2QzagYNgT2cPjYKl4IsAFD_DxwFhexSSJL-6tRxiXq14u69abseQVJUgPzbq0dVGIxWiXGoBa6lU9F5oWBoRZRsgO-i8CxuVug9-w7r76qfOwQyGJKiH0fg2qxb3dJc9pw9ZO3FESulfLA3FhJ7gkFARsu36Ydhnyy-wywct8P1YtQEvUKJ96glmZFoI31XmO0gxN9H6DG0lwJLTAbTrTQJ2ZE"/>
</div>
</div>
</section>
<!-- About Section -->
<section class="py-32 bg-surface" id="about">
<div class="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center gap-24">
<div class="relative w-full md:w-1/2 group">
<div class="absolute -top-6 -left-6 w-full h-full border-2 border-primary opacity-20 group-hover:top-0 group-hover:left-0 transition-all duration-500"></div>
<img alt="Héctor Lacorte Profile" class="w-full h-[600px] object-cover grayscale z-10 relative" data-alt="Professional portrait of Hector Lacorte, a master barber with tattoos and a groomed beard, standing in his shop with a confident look" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuy9GQuu_QjXMhKdwtWBIdC0ujRdi2doEUXOb3mTCT9f95wKQGBd-ctdHgh29hXInliJvSE3B1dHfSf2dae72BC_wfpmDKFGKFmJUI-tdXR6EjZQ9Wdk4mdzb_VhFsg2qjUqxG6uu8A7I9318iCap5yFGLN61p3FRjCJAmaKhQyiUYOXrAyte84xW7XljkeWxGd8RrQT-8fbtA-FpmdQJkrs1JsYW8woFfTwMwIVPWf55-4mfDLj7qfH3fF795-Tvr43OGWCGAGiQ"/>
</div>
<div class="w-full md:w-1/2">
<span class="text-primary font-headline tracking-[0.4em] uppercase text-sm mb-6 block">Master Barber</span>
<h2 class="text-6xl font-headline font-bold tracking-tight text-on-surface mb-8">Héctor Lacorte</h2>
<div class="space-y-6 text-outline font-light leading-relaxed text-lg">
<p>Con más de una década perfeccionando el arte de la barbería tradicional, Héctor ha creado un espacio donde la técnica se encuentra con la individualidad.</p>
<p>Cada cliente que entra en mi estudio recibe más que un simple corte; recibe una asesoría completa basada en sus facciones, estilo de vida y personalidad única.</p>
<p class="font-headline italic text-on-surface text-xl">"La precisión no es una opción, es nuestra firma."</p>
</div>
<div class="mt-12 flex gap-12 border-t border-outline/10 pt-8">
<div>
<span class="block text-2xl font-headline font-bold text-on-surface">12+</span>
<span class="text-xs uppercase tracking-widest text-outline">Años de experiencia</span>
</div>
<div>
<span class="block text-2xl font-headline font-bold text-on-surface">5k+</span>
<span class="text-xs uppercase tracking-widest text-outline">Cortes realizados</span>
</div>
</div>
</div>
</div>
</section>
<!-- Instagram Strip -->
<section class="py-20 bg-surface-container-lowest border-y border-outline/5 overflow-hidden">
<div class="flex flex-col md:flex-row items-center justify-between px-12 gap-8">
<div class="flex items-center gap-4">
<span class="material-symbols-outlined text-4xl text-primary">camera_alt</span>
<div>
<h4 class="font-headline font-bold text-2xl text-on-surface">@hector.lacorte</h4>
<p class="text-outline text-xs uppercase tracking-widest">Síguenos para inspiración diaria</p>
</div>
</div>
<button class="px-10 py-4 border border-primary text-primary font-headline font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all">
                    Follow on Instagram
                </button>
</div>
</section>
</main>
<!-- Footer -->
<footer class="bg-[#0E0E0E] dark:bg-[#0E0E0E] grid grid-cols-1 md:grid-cols-3 gap-12 px-12 py-20 w-full font-['Manrope'] text-xs uppercase tracking-[0.2em]">
<div class="flex flex-col gap-6">
<span class="text-lg font-black text-[#E5E2E1] font-headline">Héctor Lacorte</span>
<p class="text-[#99907E] leading-relaxed max-w-xs">
                Barbería de autor centrada en la excelencia y el trato personalizado para el caballero moderno.
            </p>
</div>
<div class="flex flex-col gap-6">
<span class="text-[#E6C364] font-bold">Enlaces</span>
<div class="flex flex-col gap-4">
<a class="text-[#99907E] hover:text-[#E6C364] underline decoration-1 transition-colors" href="#">Instagram @hector.lacorte</a>
<a class="text-[#99907E] hover:text-[#E6C364] underline decoration-1 transition-colors" href="#">Location</a>
<a class="text-[#99907E] hover:text-[#E6C364] underline decoration-1 transition-colors" href="#">WhatsApp</a>
</div>
</div>
<div class="flex flex-col gap-6">
<span class="text-[#E6C364] font-bold">Horario &amp; Contacto</span>
<div class="text-[#99907E] space-y-4">
<p>© 2024 HÉCTOR LACORTE.<br/>MON-SAT 11:00-14:00, 16:00-20:30</p>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm">location_on</span>
<span>Calle de la Maestría, 12, Madrid</span>
</div>
</div>
</div>
</footer>
</body></html>

---

## Reservas
<!DOCTYPE html>

<html class="dark" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Héctor Lacorte | Reservar Cita</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=Manrope:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-primary-fixed": "#241a00",
                        "tertiary-container": "#afaba7",
                        "surface-container-low": "#1c1b1b",
                        "on-tertiary": "#32302d",
                        "on-secondary-fixed": "#1b1c1c",
                        "secondary": "#c8c6c6",
                        "on-tertiary-fixed": "#1d1b19",
                        "on-surface": "#e5e2e1",
                        "error": "#ffb4ab",
                        "error-container": "#93000a",
                        "surface-bright": "#3a3939",
                        "surface": "#131313",
                        "surface-variant": "#353534",
                        "on-primary-fixed-variant": "#584400",
                        "outline-variant": "#4d4637",
                        "on-primary": "#3d2e00",
                        "on-error-container": "#ffdad6",
                        "primary-container": "#c9a84c",
                        "background": "#131313",
                        "primary-fixed": "#ffe08f",
                        "on-surface-variant": "#d0c5b2",
                        "inverse-on-surface": "#313030",
                        "secondary-fixed": "#e4e2e1",
                        "inverse-surface": "#e5e2e1",
                        "surface-container": "#201f1f",
                        "tertiary-fixed": "#e6e2dd",
                        "outline": "#99907e",
                        "on-primary-container": "#503d00",
                        "surface-container-high": "#2a2a2a",
                        "primary": "#e6c364",
                        "on-tertiary-container": "#41403c",
                        "secondary-container": "#474747",
                        "surface-container-lowest": "#0e0e0e",
                        "tertiary": "#cac6c2",
                        "primary-fixed-dim": "#e6c364",
                        "surface-tint": "#e6c364",
                        "on-background": "#e5e2e1",
                        "surface-dim": "#131313",
                        "on-tertiary-fixed-variant": "#484643",
                        "on-secondary-fixed-variant": "#474747",
                        "on-secondary": "#303030",
                        "tertiary-fixed-dim": "#cac6c1",
                        "surface-container-highest": "#353534",
                        "on-secondary-container": "#b6b5b4",
                        "inverse-primary": "#755b00",
                        "secondary-fixed-dim": "#c8c6c6",
                        "on-error": "#690005"
                    },
                    "borderRadius": {
                        "DEFAULT": "0px",
                        "lg": "0px",
                        "xl": "0px",
                        "full": "9999px"
                    },
                    "fontFamily": {
                        "headline": ["Space Grotesk"],
                        "body": ["Manrope"],
                        "label": ["Manrope"]
                    }
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            background-color: #131313;
            color: #e5e2e1;
            font-family: 'Manrope', sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-background text-on-surface">
<!-- TopNavBar -->
<header class="bg-[#131313] dark:bg-[#131313] flex justify-between items-center w-full px-8 py-6 max-w-full mx-auto sticky top-0 z-50">
<div class="flex items-center">
<span class="text-2xl font-black tracking-tighter text-[#E5E2E1] font-headline uppercase">Héctor Lacorte</span>
</div>
<nav class="hidden md:flex items-center space-x-12">
<a class="text-[#E5E2E1] hover:text-[#C9A84C] transition-colors duration-300 font-label text-sm uppercase tracking-widest" href="#">Services</a>
<a class="text-[#E5E2E1] hover:text-[#C9A84C] transition-colors duration-300 font-label text-sm uppercase tracking-widest" href="#">Gallery</a>
<a class="text-[#E5E2E1] hover:text-[#C9A84C] transition-colors duration-300 font-label text-sm uppercase tracking-widest" href="#">About</a>
</nav>
<button class="bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-wider px-6 py-3 hover:bg-[#C9A84C] transition-all duration-200 active:scale-95">
            Reservar cita
        </button>
</header>
<main class="min-h-screen">
<!-- Progress Indicator -->
<div class="w-full bg-surface-container-lowest h-1 flex">
<div class="w-1/4 bg-primary h-full"></div>
<div class="w-3/4 bg-surface-container-high h-full"></div>
</div>
<div class="max-w-7xl mx-auto px-8 py-20">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
<!-- Left Column: Content Canvas -->
<div class="lg:col-span-8">
<!-- STEP 1: SERVICE SELECTION (Active state example) -->
<section class="mb-24" id="step-1">
<div class="mb-12">
<span class="text-primary font-label text-xs uppercase tracking-[0.4em] mb-4 block">Selección de Servicio</span>
<h1 class="font-headline text-5xl md:text-6xl font-bold tracking-tight text-on-surface uppercase leading-none">Corte &amp; <br/>Afeitado</h1>
</div>
<div class="space-y-4">
<!-- Service Slot Component -->
<div class="group flex items-center justify-between bg-surface-container-low p-8 cursor-pointer hover:bg-surface-container-high transition-colors duration-300 border-l-4 border-primary">
<div class="flex flex-col">
<h3 class="font-headline text-2xl font-bold text-on-surface uppercase">Corte de Caballero</h3>
<p class="font-body text-outline mt-2 max-w-md">Asesoramiento, lavado, corte a tijera o máquina y peinado con producto premium.</p>
</div>
<div class="text-right">
<span class="font-headline text-3xl font-bold text-primary">25€</span>
<p class="font-label text-xs uppercase tracking-widest text-outline mt-1">45 MIN</p>
</div>
</div>
<div class="group flex items-center justify-between bg-surface-container-lowest p-8 cursor-pointer hover:bg-surface-container-high transition-colors duration-300">
<div class="flex flex-col">
<h3 class="font-headline text-2xl font-bold text-on-surface uppercase">Ritual de Barba</h3>
<p class="font-body text-outline mt-2 max-w-md">Perfilado con navaja, toalla caliente y aceites esenciales para hidratación profunda.</p>
</div>
<div class="text-right">
<span class="font-headline text-3xl font-bold text-on-surface group-hover:text-primary transition-colors">18€</span>
<p class="font-label text-xs uppercase tracking-widest text-outline mt-1">30 MIN</p>
</div>
</div>
<div class="group flex items-center justify-between bg-surface-container-lowest p-8 cursor-pointer hover:bg-surface-container-high transition-colors duration-300">
<div class="flex flex-col">
<h3 class="font-headline text-2xl font-bold text-on-surface uppercase">Combo Premium</h3>
<p class="font-body text-outline mt-2 max-w-md">Experiencia completa: Corte de autor y ritual de barba con tratamiento facial.</p>
</div>
<div class="text-right">
<span class="font-headline text-3xl font-bold text-on-surface group-hover:text-primary transition-colors">40€</span>
<p class="font-label text-xs uppercase tracking-widest text-outline mt-1">75 MIN</p>
</div>
</div>
</div>
</section>
<!-- STEP 2: CALENDAR & TIME (Integrated logic) -->
<section class="mb-24" id="step-2">
<div class="mb-12">
<span class="text-primary font-label text-xs uppercase tracking-[0.4em] mb-4 block">Disponibilidad</span>
<h2 class="font-headline text-5xl font-bold tracking-tight text-on-surface uppercase leading-none">Fecha &amp; <br/>Hora</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
<!-- Custom Minimalist Calendar -->
<div class="bg-surface-container-low p-8">
<div class="flex justify-between items-center mb-8">
<span class="font-headline text-xl font-bold uppercase text-on-surface">Diciembre 2024</span>
<div class="flex space-x-4">
<button class="text-primary"><span class="material-symbols-outlined">chevron_left</span></button>
<button class="text-primary"><span class="material-symbols-outlined">chevron_right</span></button>
</div>
</div>
<div class="grid grid-cols-7 gap-2 text-center">
<!-- Weekday Headers -->
<div class="font-label text-[10px] uppercase text-outline pb-4">Lu</div>
<div class="font-label text-[10px] uppercase text-outline pb-4">Ma</div>
<div class="font-label text-[10px] uppercase text-outline pb-4">Mi</div>
<div class="font-label text-[10px] uppercase text-outline pb-4">Ju</div>
<div class="font-label text-[10px] uppercase text-outline pb-4">Vi</div>
<div class="font-label text-[10px] uppercase text-outline pb-4">Sa</div>
<div class="font-label text-[10px] uppercase text-outline pb-4">Do</div>
<!-- Days (Placeholder for Logic) -->
<div class="py-3 text-outline opacity-20 text-sm">25</div>
<div class="py-3 text-outline opacity-20 text-sm">26</div>
<div class="py-3 text-outline opacity-20 text-sm">27</div>
<div class="py-3 text-outline opacity-20 text-sm">28</div>
<div class="py-3 text-outline opacity-20 text-sm">29</div>
<div class="py-3 text-outline opacity-20 text-sm">30</div>
<div class="py-3 text-on-surface text-sm">1</div>
<div class="py-3 text-on-surface text-sm bg-surface-container-high border-b-2 border-primary font-bold">2</div>
<div class="py-3 text-on-surface text-sm hover:bg-surface-container-high cursor-pointer transition-colors">3</div>
<div class="py-3 text-on-surface text-sm hover:bg-surface-container-high cursor-pointer transition-colors">4</div>
<div class="py-3 text-on-surface text-sm hover:bg-surface-container-high cursor-pointer transition-colors">5</div>
<div class="py-3 text-on-surface text-sm hover:bg-surface-container-high cursor-pointer transition-colors">6</div>
<div class="py-3 text-on-surface text-sm hover:bg-surface-container-high cursor-pointer transition-colors">7</div>
<div class="py-3 text-outline opacity-30 text-sm">8</div>
</div>
</div>
<!-- Custom Time Picker -->
<div class="bg-surface-container-lowest p-8 overflow-y-auto max-h-[400px] hide-scrollbar">
<h3 class="font-label text-xs uppercase tracking-[0.2em] text-outline mb-6">Slots Disponibles</h3>
<div class="space-y-4">
<div class="font-label text-xs text-outline pt-2 border-b border-outline/10 pb-2">Mañana (11:00 - 14:00)</div>
<button class="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-center hover:bg-primary hover:text-on-primary transition-all">11:15</button>
<button class="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-center hover:bg-primary hover:text-on-primary transition-all">12:30</button>
<div class="font-label text-xs text-outline pt-6 border-b border-outline/10 pb-2">Tarde (16:00 - 20:30)</div>
<button class="w-full py-4 bg-primary text-on-primary font-headline font-bold text-center">16:00</button>
<button class="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-center hover:bg-primary hover:text-on-primary transition-all">17:45</button>
<button class="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-center hover:bg-primary hover:text-on-primary transition-all">19:15</button>
<button class="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-center hover:bg-primary hover:text-on-primary transition-all">20:00</button>
</div>
</div>
</div>
</section>
<!-- STEP 3: DETAILS FORM -->
<section class="mb-24" id="step-3">
<div class="mb-12">
<span class="text-primary font-label text-xs uppercase tracking-[0.4em] mb-4 block">Tus Datos</span>
<h2 class="font-headline text-5xl font-bold tracking-tight text-on-surface uppercase leading-none">Confirmar <br/>Identidad</h2>
</div>
<form class="space-y-12 max-w-xl">
<div class="group relative">
<label class="font-label text-[10px] uppercase tracking-[0.3em] text-outline group-focus-within:text-primary transition-colors">Nombre Completo</label>
<input class="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary px-0 py-4 font-headline text-2xl uppercase placeholder:text-surface-variant transition-all" placeholder="EJ. JULIÁN ALBA" type="text"/>
</div>
<div class="group relative">
<label class="font-label text-[10px] uppercase tracking-[0.3em] text-outline group-focus-within:text-primary transition-colors">WhatsApp / Teléfono</label>
<input class="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary px-0 py-4 font-headline text-2xl uppercase placeholder:text-surface-variant transition-all" placeholder="+34 000 000 000" type="tel"/>
</div>
<div class="flex items-start space-x-4 pt-4">
<input class="mt-1 bg-surface-container-lowest border-outline text-primary focus:ring-primary rounded-none" type="checkbox"/>
<p class="text-xs text-outline font-body leading-relaxed uppercase tracking-tighter">Acepto los términos y el envío de recordatorios por WhatsApp.</p>
</div>
</form>
</section>
</div>
<!-- Right Column: Summary Card (Floating/Sticky) -->
<div class="lg:col-span-4">
<div class="sticky top-32">
<div class="bg-surface-container-lowest p-0 relative overflow-hidden">
<!-- Image Header for visual luxury -->
<div class="h-40 w-full relative">
<img class="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" data-alt="close-up of sharp barber scissors and a metal comb on a dark wood surface with dramatic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3M0epgaKb7lOoGZXvs1Wteqeirxhdt7dAJyhMz6ROry5DuvIvYip7xvSCmTrz0fek0wte5xTzZDJbxNNWzEBNNeZe7NkZQZzQZ6HoBkh0N60QQ7vvcz3c_k1Y-xPgD87b_fdiqyAcgRBmPyJxd5jsDJLN-MMOH9Qa4RNj2mMQeLVYZo6_UFnqW2uq_n8OUftTT58VEvFX6QxMvNQyyqMykDd1YgUBm4Ua2QK0nkAKhkr5XP8A35NxSXdhzP_iP7AKXpObC08Y65M"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
</div>
<div class="p-10 -mt-12 relative z-10">
<h4 class="font-headline text-xl font-bold text-on-surface uppercase tracking-tight mb-8">Resumen de Cita</h4>
<div class="space-y-8">
<div class="flex justify-between items-start">
<div class="space-y-1">
<p class="font-label text-[10px] uppercase text-outline tracking-widest">Servicio</p>
<p class="font-headline font-bold text-on-surface uppercase">Corte de Caballero</p>
</div>
<p class="font-headline text-xl font-bold text-primary">25€</p>
</div>
<div class="space-y-1">
<p class="font-label text-[10px] uppercase text-outline tracking-widest">Cuándo</p>
<div class="flex items-center space-x-2">
<span class="material-symbols-outlined text-primary text-sm">calendar_today</span>
<p class="font-body text-on-surface font-medium">Lunes, 2 Diciembre</p>
</div>
<div class="flex items-center space-x-2">
<span class="material-symbols-outlined text-primary text-sm">schedule</span>
<p class="font-body text-on-surface font-medium">16:00 HRS</p>
</div>
</div>
<div class="space-y-1">
<p class="font-label text-[10px] uppercase text-outline tracking-widest">Dónde</p>
<p class="font-body text-on-surface text-sm uppercase">C. de la Madera, 24, Madrid</p>
</div>
</div>
<div class="mt-12 pt-8 border-t border-outline/10">
<button class="w-full bg-primary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-5 hover:bg-primary-container transition-all active:scale-95">
                                        Confirmar Cita
                                    </button>
<p class="text-[10px] text-center text-outline mt-4 uppercase tracking-widest font-label">Cancelación gratuita hasta 24h antes</p>
</div>
</div>
</div>
<!-- Success Feedback (Hidden by default, shown for demo context) -->
<div class="hidden mt-8 bg-surface-container-low p-6 border-l-4 border-primary">
<div class="flex items-center space-x-4">
<span class="material-symbols-outlined text-primary" data-weight="fill">check_circle</span>
<p class="font-headline font-bold uppercase text-sm tracking-widest">Reserva realizada con éxito</p>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Footer -->
<footer class="bg-[#0E0E0E] dark:bg-[#0E0E0E] grid grid-cols-1 md:grid-cols-3 gap-12 px-12 py-20 w-full border-t border-outline/5">
<div>
<span class="text-lg font-black text-[#E5E2E1] font-headline uppercase block mb-6">Héctor Lacorte</span>
<p class="font-['Manrope'] text-xs uppercase tracking-[0.2em] text-[#99907E]">© 2024 Héctor Lacorte.<br/>Mon-Sat 11:00-14:00, 16:00-20:30</p>
</div>
<div class="flex flex-col space-y-4">
<span class="font-['Manrope'] text-xs uppercase tracking-[0.2em] text-[#E6C364] mb-2">Connect</span>
<a class="font-['Manrope'] text-xs uppercase tracking-[0.2em] text-[#99907E] hover:text-[#E6C364] underline decoration-1" href="#">Instagram @hector.lacorte</a>
<a class="font-['Manrope'] text-xs uppercase tracking-[0.2em] text-[#99907E] hover:text-[#E6C364] underline decoration-1" href="#">WhatsApp</a>
</div>
<div class="flex flex-col space-y-4">
<span class="font-['Manrope'] text-xs uppercase tracking-[0.2em] text-[#E6C364] mb-2">Legal</span>
<a class="font-['Manrope'] text-xs uppercase tracking-[0.2em] text-[#99907E] hover:text-[#E6C364] underline decoration-1" href="#">Location</a>
<a class="font-['Manrope'] text-xs uppercase tracking-[0.2em] text-[#99907E] hover:text-[#E6C364] underline decoration-1" href="#">Privacy Policy</a>
</div>
</footer>
</body></html>

---

## Panel de Control
<!DOCTYPE html>

<html class="dark" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=Manrope:wght@200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-primary-fixed": "#241a00",
                        "tertiary-container": "#afaba7",
                        "surface-container-low": "#1c1b1b",
                        "on-tertiary": "#32302d",
                        "on-secondary-fixed": "#1b1c1c",
                        "secondary": "#c8c6c6",
                        "on-tertiary-fixed": "#1d1b19",
                        "on-surface": "#e5e2e1",
                        "error": "#ffb4ab",
                        "error-container": "#93000a",
                        "surface-bright": "#3a3939",
                        "surface": "#131313",
                        "surface-variant": "#353534",
                        "on-primary-fixed-variant": "#584400",
                        "outline-variant": "#4d4637",
                        "on-primary": "#3d2e00",
                        "on-error-container": "#ffdad6",
                        "primary-container": "#c9a84c",
                        "background": "#131313",
                        "primary-fixed": "#ffe08f",
                        "on-surface-variant": "#d0c5b2",
                        "inverse-on-surface": "#313030",
                        "secondary-fixed": "#e4e2e1",
                        "inverse-surface": "#e5e2e1",
                        "surface-container": "#201f1f",
                        "tertiary-fixed": "#e6e2dd",
                        "outline": "#99907e",
                        "on-primary-container": "#503d00",
                        "surface-container-high": "#2a2a2a",
                        "primary": "#e6c364",
                        "on-tertiary-container": "#41403c",
                        "surface-container-lowest": "#0e0e0e",
                        "tertiary": "#cac6c2",
                        "primary-fixed-dim": "#e6c364",
                        "surface-tint": "#e6c364",
                        "on-background": "#e5e2e1",
                        "surface-dim": "#131313",
                        "on-tertiary-fixed-variant": "#484643",
                        "on-secondary-fixed-variant": "#474747",
                        "on-secondary": "#303030",
                        "tertiary-fixed-dim": "#cac6c1",
                        "surface-container-highest": "#353534",
                        "on-secondary-container": "#b6b5b4",
                        "inverse-primary": "#755b00",
                        "secondary-fixed-dim": "#c8c6c6",
                        "on-error": "#690005"
                    },
                    "borderRadius": {
                        "DEFAULT": "0px",
                        "lg": "0px",
                        "xl": "0px",
                        "full": "9999px"
                    },
                    "fontFamily": {
                        "headline": ["Space Grotesk"],
                        "body": ["Manrope"],
                        "label": ["Manrope"]
                    }
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0E0E0E; }
        ::-webkit-scrollbar-thumb { background: #3A3939; }
        body { background-color: #131313; color: #E5E2E1; }
    </style>
</head>
<body class="font-body selection:bg-primary selection:text-on-primary">
<div class="flex h-screen overflow-hidden">
<!-- SideNavBar -->
<aside class="bg-[#0E0E0E] text-[#E6C364] flex flex-col h-screen p-0 w-64 shrink-0 transition-all duration-300">
<div class="px-8 py-10 flex flex-col items-center">
<div class="w-16 h-16 bg-surface-container mb-4 overflow-hidden">
<img alt="Héctor Lacorte Profile" class="w-full h-full object-cover grayscale opacity-80" data-alt="editorial black and white close-up portrait of a professional male barber with styled hair and sharp grooming" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx0Pk9Ffq9aj-wkp0tYfCfeRvcbLQ9XRC5hy6oZA4h0hqdu-HB6il-t-6m8XNDd1hEPGO1gJYklsIdwZtki34D2dJIbc5dO2R8LT8jCf-x0wVAGwSZKBY0QKchERBbyZis1cEb6vl0RRIHKLXhccfuoDZ_oqANm2Wwu7W1KbeTBmP0zQSuReSLEPK0T8zmXDXOkbRzKNOV2WFVnu8j806HNlSJEBOOJzmQtTD3SijZwEcBj4VpLfW_9LihnQKYSQ6AGEXn94r_yMs"/>
</div>
<h1 class="text-xl font-black text-[#E6C364] font-headline uppercase tracking-tighter">Héctor Lacorte</h1>
<p class="text-[10px] uppercase tracking-[0.3em] text-[#99907E] mt-1">Master Barber</p>
</div>
<nav class="flex-1 px-4 space-y-2 mt-8">
<!-- Active Tab: Appointments -->
<a class="flex items-center gap-4 px-4 py-4 text-[#E6C364] bg-[#1C1B1B] font-bold transition-all group" href="#">
<span class="material-symbols-outlined text-xl" data-icon="event_note">event_note</span>
<span class="font-label text-sm uppercase tracking-widest">Appointments</span>
</a>
<a class="flex items-center gap-4 px-4 py-4 text-[#99907E] hover:bg-[#1C1B1B] hover:text-[#E5E2E1] transition-all group" href="#">
<span class="material-symbols-outlined text-xl" data-icon="calendar_today">calendar_today</span>
<span class="font-label text-sm uppercase tracking-widest">Calendar</span>
</a>
<a class="flex items-center gap-4 px-4 py-4 text-[#99907E] hover:bg-[#1C1B1B] hover:text-[#E5E2E1] transition-all group" href="#">
<span class="material-symbols-outlined text-xl" data-icon="content_cut">content_cut</span>
<span class="font-label text-sm uppercase tracking-widest">Services</span>
</a>
<a class="flex items-center gap-4 px-4 py-4 text-[#99907E] hover:bg-[#1C1B1B] hover:text-[#E5E2E1] transition-all group" href="#">
<span class="material-symbols-outlined text-xl" data-icon="settings">settings</span>
<span class="font-label text-sm uppercase tracking-widest">Settings</span>
</a>
</nav>
<div class="p-6">
<button class="w-full py-4 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest hover:bg-primary-container transition-all">
                    New Appointment
                </button>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto bg-surface relative">
<!-- Header Section -->
<header class="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl px-12 py-10 flex justify-between items-end">
<div>
<span class="text-primary text-xs font-bold tracking-[0.4em] uppercase mb-2 block">DASHBOARD</span>
<h2 class="text-5xl font-headline font-bold tracking-tighter text-on-surface">TODAY'S AGENDA</h2>
</div>
<div class="text-right">
<p class="text-on-surface-variant font-headline font-medium text-lg uppercase tracking-tight">MONDAY, 24 JUNE</p>
<p class="text-primary text-xs uppercase tracking-widest mt-1">9 ACTIVE APPOINTMENTS</p>
</div>
</header>
<div class="px-12 pb-24 space-y-16">
<!-- Summary Stats (Tonal Layering) -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-0">
<div class="bg-surface-container-low p-8 border-r border-outline/10">
<p class="text-[10px] uppercase tracking-[0.3em] text-outline mb-4">REVENUE TODAY</p>
<p class="text-4xl font-headline font-bold text-primary">€425.00</p>
</div>
<div class="bg-surface-container-low p-8 border-r border-outline/10">
<p class="text-[10px] uppercase tracking-[0.3em] text-outline mb-4">AVAILABLE SLOTS</p>
<p class="text-4xl font-headline font-bold text-on-surface">02</p>
</div>
<div class="bg-surface-container-low p-8">
<p class="text-[10px] uppercase tracking-[0.3em] text-outline mb-4">CANCELLATIONS</p>
<p class="text-4xl font-headline font-bold text-error">00</p>
</div>
</section>
<!-- Appointment Feed -->
<section>
<div class="flex justify-between items-center mb-8">
<h3 class="text-2xl font-headline font-bold uppercase tracking-tight">TIMELINE</h3>
<div class="flex gap-4">
<button class="px-4 py-1 text-[10px] uppercase tracking-widest border border-outline/30 text-outline hover:border-primary hover:text-primary transition-all">Today</button>
<button class="px-4 py-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Upcoming</button>
</div>
</div>
<div class="space-y-4">
<!-- Appointment Slot -->
<div class="bg-surface-container-lowest group flex items-center transition-all hover:bg-surface-container-low">
<div class="w-24 py-8 flex flex-col items-center border-r border-outline/5">
<span class="text-xs font-headline font-bold text-primary">11:00</span>
<span class="text-[9px] uppercase tracking-tighter text-outline mt-1">45 MIN</span>
</div>
<div class="flex-1 px-10 flex items-center justify-between">
<div class="flex flex-col">
<h4 class="text-lg font-headline font-bold text-on-surface tracking-tight">JULIÁN SÁNCHEZ</h4>
<p class="text-xs uppercase tracking-widest text-outline">Classic Cut &amp; Hot Towel Shave</p>
</div>
<div class="flex items-center gap-12">
<div class="text-right">
<p class="text-lg font-headline font-bold text-on-surface">€45.00</p>
<p class="text-[10px] uppercase tracking-[0.2em] text-primary">CONFIRMED</p>
</div>
<div class="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="material-symbols-outlined text-on-surface-variant hover:text-primary" data-icon="edit">edit</button>
<button class="material-symbols-outlined text-on-surface-variant hover:text-error" data-icon="cancel">cancel</button>
</div>
</div>
</div>
</div>
<!-- Appointment Slot (In Progress) -->
<div class="bg-surface-container-low border-l-4 border-primary flex items-center">
<div class="w-24 py-8 flex flex-col items-center">
<span class="text-xs font-headline font-bold text-primary">12:00</span>
<span class="text-[9px] uppercase tracking-tighter text-outline mt-1">30 MIN</span>
</div>
<div class="flex-1 px-10 flex items-center justify-between">
<div class="flex flex-col">
<div class="flex items-center gap-3">
<h4 class="text-lg font-headline font-bold text-on-surface tracking-tight">MARC ROSS</h4>
<span class="inline-block w-2 h-2 bg-primary animate-pulse"></span>
</div>
<p class="text-xs uppercase tracking-widest text-outline">Beard Sculpting</p>
</div>
<div class="flex items-center gap-12">
<div class="text-right">
<p class="text-lg font-headline font-bold text-on-surface">€30.00</p>
<p class="text-[10px] uppercase tracking-[0.2em] text-primary">IN CHAIR</p>
</div>
<div class="w-20"></div>
</div>
</div>
</div>
<!-- Appointment Slot (Blocked) -->
<div class="bg-surface-container-lowest opacity-50 flex items-center grayscale">
<div class="w-24 py-8 flex flex-col items-center border-r border-outline/5">
<span class="text-xs font-headline font-bold text-outline">12:30</span>
<span class="text-[9px] uppercase tracking-tighter text-outline mt-1">30 MIN</span>
</div>
<div class="flex-1 px-10 flex items-center justify-between italic">
<div class="flex flex-col">
<h4 class="text-lg font-headline font-medium text-outline tracking-tight uppercase">Blocked: Staff Lunch</h4>
</div>
<div class="flex items-center gap-4">
<button class="material-symbols-outlined text-outline hover:text-primary transition-all" data-icon="lock_open">lock_open</button>
</div>
</div>
</div>
<!-- Appointment Slot -->
<div class="bg-surface-container-lowest group flex items-center transition-all hover:bg-surface-container-low">
<div class="w-24 py-8 flex flex-col items-center border-r border-outline/5">
<span class="text-xs font-headline font-bold text-primary">13:00</span>
<span class="text-[9px] uppercase tracking-tighter text-outline mt-1">60 MIN</span>
</div>
<div class="flex-1 px-10 flex items-center justify-between">
<div class="flex flex-col">
<h4 class="text-lg font-headline font-bold text-on-surface tracking-tight">ADRIÁN LÓPEZ</h4>
<p class="text-xs uppercase tracking-widest text-outline">The Master Ritual (Hair + Beard + Facial)</p>
</div>
<div class="flex items-center gap-12">
<div class="text-right">
<p class="text-lg font-headline font-bold text-on-surface">€85.00</p>
<p class="text-[10px] uppercase tracking-[0.2em] text-primary">PENDING</p>
</div>
<div class="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="material-symbols-outlined text-on-surface-variant hover:text-primary" data-icon="check_circle">check_circle</button>
<button class="material-symbols-outlined text-on-surface-variant hover:text-primary" data-icon="edit">edit</button>
<button class="material-symbols-outlined text-on-surface-variant hover:text-error" data-icon="cancel">cancel</button>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Management Bento Grid -->
<section class="grid grid-cols-1 lg:grid-cols-2 gap-12">
<!-- Services Management -->
<div class="bg-surface-container-lowest p-10">
<div class="flex justify-between items-start mb-10">
<h3 class="text-2xl font-headline font-bold uppercase tracking-tight">SERVICES MENU</h3>
<button class="text-[10px] uppercase tracking-widest text-primary border-b border-primary/30 pb-1">Manage All</button>
</div>
<div class="space-y-6">
<div class="flex justify-between items-center group cursor-pointer border-b border-outline/5 pb-4">
<div class="flex flex-col">
<span class="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">Haircut &amp; Style</span>
<span class="text-[10px] text-outline uppercase tracking-widest">30 MIN</span>
</div>
<span class="text-lg font-headline font-bold text-primary">€30</span>
</div>
<div class="flex justify-between items-center group cursor-pointer border-b border-outline/5 pb-4">
<div class="flex flex-col">
<span class="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">Beard Trim</span>
<span class="text-[10px] text-outline uppercase tracking-widest">20 MIN</span>
</div>
<span class="text-lg font-headline font-bold text-primary">€20</span>
</div>
<div class="flex justify-between items-center group cursor-pointer border-b border-outline/5 pb-4">
<div class="flex flex-col">
<span class="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">The Ritual</span>
<span class="text-[10px] text-outline uppercase tracking-widest">60 MIN</span>
</div>
<span class="text-lg font-headline font-bold text-primary">€65</span>
</div>
</div>
<button class="mt-8 w-full border border-outline/30 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-outline hover:border-primary hover:text-primary transition-all">
                            Add New Service
                        </button>
</div>
<!-- Availability Block -->
<div class="bg-surface-container-low p-10">
<div class="flex justify-between items-start mb-10">
<h3 class="text-2xl font-headline font-bold uppercase tracking-tight">AVAILABILITY</h3>
</div>
<div class="space-y-8">
<div class="flex items-center gap-6">
<div class="w-12 h-12 bg-surface-container flex items-center justify-center border border-outline/10 text-primary">
<span class="material-symbols-outlined" data-icon="block">block</span>
</div>
<div class="flex-1">
<p class="text-xs font-bold uppercase tracking-widest text-on-surface mb-1">Block Time Slot</p>
<p class="text-[10px] text-outline uppercase tracking-tight">Quickly remove a window from the public calendar</p>
</div>
</div>
<form class="space-y-4">
<div class="grid grid-cols-2 gap-4">
<div class="border-b border-outline/20 py-2">
<label class="block text-[8px] uppercase tracking-widest text-outline mb-1">From</label>
<input class="bg-transparent border-none text-on-surface font-headline font-bold p-0 w-full focus:ring-0" type="time" value="14:00"/>
</div>
<div class="border-b border-outline/20 py-2">
<label class="block text-[8px] uppercase tracking-widest text-outline mb-1">Until</label>
<input class="bg-transparent border-none text-on-surface font-headline font-bold p-0 w-full focus:ring-0" type="time" value="16:00"/>
</div>
</div>
<button class="w-full bg-surface-bright py-4 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-outline hover:text-surface transition-all" type="button">Apply Block</button>
</form>
<div class="pt-6 border-t border-outline/10">
<p class="text-[10px] uppercase tracking-[0.2em] text-primary mb-4">ACTIVE BLOCKS</p>
<div class="flex justify-between items-center text-xs py-2">
<span class="text-on-surface font-medium uppercase tracking-widest">Staff Meeting (Every Mon)</span>
<span class="text-outline">09:00 - 10:00</span>
</div>
</div>
</div>
</div>
</section>
</div>
<!-- Footer -->
<footer class="bg-[#0E0E0E] grid grid-cols-1 md:grid-cols-3 gap-12 px-12 py-20 w-full">
<div class="space-y-4">
<p class="text-lg font-black text-[#E5E2E1] font-headline uppercase tracking-tighter">Héctor Lacorte</p>
<p class="text-[#99907E] font-['Manrope'] text-xs uppercase tracking-[0.2em] leading-relaxed">
                        © 2024 HÉCTOR LACORTE.<br/>MON-SAT 11:00-14:00, 16:00-20:30
                    </p>
</div>
<div class="flex flex-col space-y-3">
<p class="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">QUICK LINKS</p>
<a class="text-[#99907E] hover:text-[#E6C364] underline decoration-1 font-['Manrope'] text-xs uppercase tracking-[0.2em]" href="#">Instagram @hector.lacorte</a>
<a class="text-[#99907E] hover:text-[#E6C364] underline decoration-1 font-['Manrope'] text-xs uppercase tracking-[0.2em]" href="#">Location</a>
<a class="text-[#99907E] hover:text-[#E6C364] underline decoration-1 font-['Manrope'] text-xs uppercase tracking-[0.2em]" href="#">WhatsApp</a>
</div>
<div class="text-right">
<p class="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">SYSTEM STATUS</p>
<div class="flex items-center justify-end gap-2">
<span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
<span class="text-[#99907E] font-['Manrope'] text-xs uppercase tracking-[0.2em]">All Systems Operational</span>
</div>
</div>
</footer>
</main>
</div>
</body></html>
