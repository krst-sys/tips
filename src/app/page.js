"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const menuItems = [
    "Início",
    "Casas de Apostas",
    "Como Funciona",
    "Estratégias",
    "Depoimentos",
    "FAQ",
  ];

  const topCards = [
    {
      title: "Rodadas Grátis",
      desc: "Aprenda a pegar em\nvárias casas",
      icon: "gift",
    },
    {
      title: "Estratégias Testadas",
      desc: "Métodos que realmente\nfuncionam",
      icon: "coins",
    },
    {
      title: "Dinheiro Real",
      desc: "Transforme centavos\nem lucro",
      icon: "money",
    },
  ];

  const learnCards = [
    {
      title: "Melhores Casas",
      desc: "Descubra quais casas dão rodadas grátis e como pegá-las diariamente",
      icon: "🏆",
    },
    {
      title: "Como Resgatar",
      desc: "Passo a passo para conseguir suas rodadas grátis todos os dias",
      icon: "🎁",
    },
    {
      title: "Estratégias de Múltiplas",
      desc: "Técnicas profissionais para maximizar seus ganhos",
      icon: "🎯",
    },
    {
      title: "Gestão de Banca",
      desc: "Como administrar seu dinheiro para lucrar mais",
      icon: "💲",
    },
  ];

  const testimonials = [
    {
      initials: "MR",
      name: "Matheus R.",
      city: "São Paulo, SP",
      text: "Comecei com R$ 2,00 em rodadas grátis e faturei R$ 340 na primeira semana!",
    },
    {
      initials: "CA",
      name: "Camila A.",
      city: "Rio de Janeiro, RJ",
      text: "As estratégias de múltiplas realmente funcionam. Já lucrei mais de R$ 1.200!",
    },
    {
      initials: "LS",
      name: "Lucas S.",
      city: "Belo Horizonte, MG",
      text: "Método simples e eficaz. Mudou minha forma de apostar!",
    },
    {
      initials: "JP",
      name: "João P.",
      city: "Curitiba, PR",
      text: "Eu achava que bônus não dava em nada. Depois do método, comecei a ver retorno de verdade.",
    },
    {
      initials: "AF",
      name: "Amanda F.",
      city: "Fortaleza, CE",
      text: "Gostei porque é direto ao ponto. Aplicando certo, dá para transformar pouco em algo real.",
    },
    {
      initials: "RN",
      name: "Rafael N.",
      city: "Recife, PE",
      text: "A parte de múltiplas foi o que mais abriu minha mente. Hoje eu entro nas promos com outro olhar.",
    },
    {
      initials: "TB",
      name: "Thiago B.",
      city: "Goiânia, GO",
      text: "Já testei muita coisa aleatória. Esse foi o primeiro método que realmente fez sentido para mim.",
    },
    {
      initials: "EC",
      name: "Eduarda C.",
      city: "Porto Alegre, RS",
      text: "Mesmo começando com valor baixo, consegui organizar melhor minhas entradas e aproveitar mais as ofertas.",
    },
  ];

  const totalTestimonials = testimonials.length;
  const visibleCount = Math.min(3, totalTestimonials);

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const nextTestimonials = () => {
    setTestimonialIndex((prev) => (prev + 1) % totalTestimonials);
  };

  const prevTestimonials = () => {
    setTestimonialIndex(
      (prev) => (prev - 1 + totalTestimonials) % totalTestimonials
    );
  };

  useEffect(() => {
    if (totalTestimonials <= 3) return;

    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % totalTestimonials);
    }, 3500);

    return () => clearInterval(interval);
  }, [totalTestimonials]);

  const visibleTestimonials = Array.from({ length: visibleCount }, (_, i) => {
    return testimonials[(testimonialIndex + i) % totalTestimonials];
  });

  function SmallIcon({ type }) {
    const wrapper =
      "flex h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-[#112313]";

    if (type === "gift") {
      return (
        <div className={wrapper}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              stroke="#8df126"
              strokeWidth="1.55"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="10" width="14" height="9" rx="1.6" />
              <path d="M12 10V19" />
              <path d="M4 7.5H20V10H4V7.5Z" />
              <path d="M12 7.5C12 5.9 11.2 4.8 9.9 4.8C8.7 4.8 7.9 5.5 7.9 6.6C7.9 7 8 7.2 8.2 7.5H12Z" />
              <path d="M12 7.5C12 5.9 12.8 4.8 14.1 4.8C15.3 4.8 16.1 5.5 16.1 6.6C16.1 7 16 7.2 15.8 7.5H12Z" />
            </g>
          </svg>
        </div>
      );
    }

    if (type === "coins") {
      return (
        <div className={wrapper}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              stroke="#8df126"
              strokeWidth="1.55"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="6.4" rx="6.2" ry="2.1" />
              <path d="M5.8 6.4V9.4C5.8 10.6 8.6 11.5 12 11.5C15.4 11.5 18.2 10.6 18.2 9.4V6.4" />
              <path d="M5.8 9.4V12.4C5.8 13.6 8.6 14.5 12 14.5C15.4 14.5 18.2 13.6 18.2 12.4V9.4" />
              <path d="M5.8 12.4V15.4C5.8 16.6 8.6 17.5 12 17.5C15.4 17.5 18.2 16.6 18.2 15.4V12.4" />
            </g>
          </svg>
        </div>
      );
    }

    return (
      <div className={wrapper}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            stroke="#8df126"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4.5" y="7" width="15" height="10" rx="1.8" />
            <circle cx="9" cy="12" r="1.05" fill="#8df126" stroke="none" />
            <path d="M13.2 10H18" />
            <path d="M13.2 14H18" />
          </g>
        </svg>
      </div>
    );
  }

  const primaryButtonClass =
    "rounded-[12px] border border-[#c8ff8a]/20 !bg-[#8cdf1e] font-black tracking-[0.01em] !text-[#081200] shadow-[0_10px_26px_rgba(140,223,30,0.24)] transition hover:!bg-[#9df52d] hover:shadow-[0_12px_30px_rgba(140,223,30,0.30)] [text-shadow:none]";

  return (
    <main className="bg-[#050910] text-white">
      <header className="border-b border-white/8 bg-[#040910]">
        <div className="mx-auto flex h-[78px] max-w-[1600px] items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="text-[44px] font-black leading-none text-[#97f21f]">
              α
            </div>
            <div className="text-[24px] font-extrabold tracking-[-0.02em]">
              ALPHA <span className="text-[#79db21]">TIPS</span>
            </div>
          </div>

          <nav className="hidden items-center gap-10 text-[13px] font-semibold text-white/84 xl:flex">
            {menuItems.map((item) => (
              <a key={item} href="#" className="transition hover:text-white">
                {item}
              </a>
            ))}
          </nav>

          <a
            href="#cta"
            className={`${primaryButtonClass} px-7 py-3 text-[13px]`}
            style={{ color: "#081200", WebkitTextFillColor: "#081200" }}
          >
            QUERO COMEÇAR AGORA!
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#040910_0%,#050b12_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_14%,rgba(120,255,0,0.10),transparent_18%),radial-gradient(circle_at_91%_20%,rgba(255,255,255,0.08),transparent_8%)]" />

        <div className="mx-auto grid max-w-[1600px] gap-4 px-8 pb-4 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative z-20 -mt-15">
            <div className="mb-5 inline-flex items-center rounded-full border border-[#7cd81d]/25 bg-[#0d1d10] px-5 py-2 text-[12px] font-extrabold text-[#95ef24]">
              <span className="mr-3 h-2.5 w-2.5 rounded-full bg-[#95ef24]" />
              GUIA COMPLETO E ATUALIZADO
            </div>

            <h1 className="max-w-[620px] text-[54px] font-black uppercase italic leading-[0.9] tracking-[-0.05em] xl:text-[66px]">
              FATURE COM
              <br />
              <span className="text-[#8df126]">APOSTAS ESPORTIVAS</span>
            </h1>

            <p className="mt-5 max-w-[620px] text-[16px] leading-[1.4] text-white/84">
              Aprenda como transformar rodadas grátis em dinheiro real usando
              estratégias profissionais de múltiplas
            </p>

            <div className="mt-7 grid max-w-[760px] gap-0 md:grid-cols-3">
              {topCards.map((card, index) => (
                <div
                  key={card.title}
                  className={`px-4 py-2 ${
                    index !== 0 ? "border-l border-white/8" : ""
                  }`}
                >
                  <SmallIcon type={card.icon} />
                  <h3 className="mt-4 text-[17px] font-bold leading-[1.08] tracking-[-0.03em]">
                    {card.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-[14px] leading-[1.36] text-white/68">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <a
                href="#cta"
                className={`${primaryButtonClass} flex h-[54px] w-full max-w-[560px] items-center justify-center text-[17px]`}
                style={{ color: "#081200", WebkitTextFillColor: "#081200" }}
              >
                QUERO APRENDER AGORA!
              </a>

              <div className="mt-4 flex items-center gap-3 text-[13px] text-white/70">
                <span className="text-[#ffc63b]">🔒</span>
                <span>Acesso imediato e 100% seguro</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 hidden h-[610px] lg:block">
            <div className="absolute inset-y-0 right-[-60px] w-[1120px]">
              <img
                src="/hero-layout.png"
                alt="Hero Alpha Tips"
                className="absolute right-0 top-[42%] z-10 w-full max-w-none -translate-y-1/2 pointer-events-none select-none"
              />

              <div className="absolute inset-y-0 left-[-760px] right-0 top-[-80px] bottom-[-70px] z-20 pointer-events-none bg-[linear-gradient(90deg,rgba(4,9,16,1)_0%,rgba(4,9,16,1)_20%,rgba(4,9,16,0.96)_34%,rgba(4,9,16,0.82)_48%,rgba(4,9,16,0.50)_62%,rgba(4,9,16,0.16)_76%,rgba(4,9,16,0)_88%)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[linear-gradient(180deg,#050b12_0%,#07111a_100%)] py-16">
        <div className="mx-auto max-w-[1600px] px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-[#7cd81d]/18 bg-[#0d1d10] px-5 py-2 text-[13px] font-extrabold uppercase tracking-[0.02em] text-[#95ef24]">
              <span className="mr-3 h-2.5 w-2.5 rounded-full bg-[#95ef24]" />
              O QUE VOCÊ VAI APRENDER
            </div>

            <h2 className="mt-6 text-[34px] font-bold tracking-[-0.04em] text-white md:text-[52px]">
              Do Zero ao Lucro com{" "}
              <span className="text-[#7ee02a]">Estratégias Comprovadas</span>
            </h2>

            <p className="mt-3 text-[18px] text-white/72">
              Um método passo a passo para você começar a faturar hoje mesmo
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {learnCards.map((card) => (
              <div
                key={card.title}
                className="group rounded-[24px] border border-white/7 bg-[linear-gradient(180deg,rgba(13,18,28,0.92)_0%,rgba(7,12,20,0.96)_100%)] px-7 py-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#7ee02a]/18 hover:shadow-[0_14px_40px_rgba(0,0,0,0.32)]"
              >
                <div className="text-[52px] leading-none">{card.icon}</div>

                <h3 className="mt-6 text-[22px] font-extrabold leading-[1.12] tracking-[-0.03em] text-white md:text-[24px]">
                  {card.title}
                </h3>

                <p className="mt-4 text-[16px] leading-[1.55] text-white/64">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/[0.04] bg-[#040a12] py-8">
        <div className="absolute inset-0 z-0">
          <img
            src="/potential-bg.png"
            alt="Background seção potencial"
            className="h-full w-full object-cover object-[91%_50%] opacity-[0.18] pointer-events-none select-none"
          />
        </div>

        <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(4,10,18,1)_0%,rgba(4,10,18,0.99)_18%,rgba(4,10,18,0.965)_36%,rgba(4,10,18,0.89)_54%,rgba(4,10,18,0.58)_76%,rgba(4,10,18,0.16)_100%)]" />

        <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_96%_10%,rgba(255,255,255,0.08),transparent_10%),radial-gradient(circle_at_84%_78%,rgba(126,224,42,0.04),transparent_18%)]" />

        <div className="relative z-10 mx-auto grid max-w-[1280px] gap-10 px-8 lg:grid-cols-[540px_520px] lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#7cd81d]/18 bg-[#0b1810]/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#95ef24]">
              <span className="mr-2.5 h-2 w-2 rounded-full bg-[#95ef24]" />
              VEJA O POTENCIAL
            </div>

            <h2 className="mt-5 max-w-[430px] text-[28px] font-black leading-[1.05] tracking-[-0.045em] text-white md:text-[33px]">
              Transforme Centavos em Dinheiro Real
            </h2>

            <div className="mt-7 grid gap-4 md:grid-cols-[210px_82px_250px] md:items-center">
              <div className="relative overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,16,24,0.96)_0%,rgba(6,11,18,0.98)_100%)] px-5 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

                <h3 className="mb-5 text-center text-[14px] font-extrabold text-white">
                  SEM ESTRATÉGIA
                </h3>

                <div className="space-y-4 text-[14px] text-white/72">
                  <div className="flex items-center justify-between border-b border-white/6 pb-3">
                    <span>Rodada grátis</span>
                    <span>R$ 0,50</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/6 pb-3">
                    <span>Aposta única</span>
                    <span>R$ 0,50</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Retorno</span>
                    <span>R$ 0,00</span>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <span className="inline-flex rounded-full bg-red-500/14 px-4 py-1.5 text-[12px] font-bold text-red-400">
                    Perde na maioria
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <svg
                  width="96"
                  height="58"
                  viewBox="0 0 96 58"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[82px]"
                >
                  <path
                    d="M8 23C22 38 39 42 63 37"
                    stroke="#7ee02a"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M59 25L82 37L61 50"
                    stroke="#7ee02a"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="relative overflow-hidden rounded-[20px] border border-[#7ee02a]/22 bg-[linear-gradient(180deg,rgba(20,60,18,0.42)_0%,rgba(7,20,14,0.97)_100%)] px-5 py-5 shadow-[0_14px_28px_rgba(40,120,32,0.12)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(126,224,42,0.14),transparent_46%)]" />
                <div className="absolute inset-x-0 top-0 h-px bg-[#7ee02a]/28" />

                <div className="relative z-10">
                  <h3 className="mb-5 text-center text-[14px] font-extrabold text-[#95ef24]">
                    COM ESTRATÉGIA
                  </h3>

                  <div className="space-y-4 text-[14px] text-white/86">
                    <div className="flex items-center justify-between border-b border-[#7ee02a]/10 pb-3">
                      <span>Rodada grátis</span>
                      <span className="font-bold text-[#95ef24]">R$ 0,50</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-[#7ee02a]/10 pb-3">
                      <span>Múltipla otimizada</span>
                      <span className="font-bold text-[#95ef24]">R$ 0,50</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Retorno potencial</span>
                      <span className="font-bold text-[#95ef24]">R$ 50,00+</span>
                    </div>
                  </div>

                  <div className="mt-5 text-center">
                    <span className="inline-flex rounded-full bg-[#7ee02a]/14 px-4 py-1.5 text-[12px] font-bold text-[#95ef24]">
                      Lucro de 10.000%+
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="justify-self-end w-full max-w-[520px]">
            <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,14,22,0.80)_0%,rgba(5,10,18,0.90)_100%)] px-6 py-6 shadow-[0_12px_28px_rgba(0,0,0,0.14)] backdrop-blur-[3px]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(126,224,42,0.05),transparent_28%)]" />

              <div className="relative z-10">
                <div className="inline-flex items-center rounded-full border border-[#7cd81d]/18 bg-[#0b1810]/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#95ef24]">
                  <span className="mr-2.5 h-2 w-2 rounded-full bg-[#95ef24]" />
                  POR QUE FUNCIONA?
                </div>

                <h2 className="mt-5 max-w-[410px] text-[27px] font-black leading-[1.06] tracking-[-0.045em] text-white md:text-[32px]">
                  O Método que as Casas Não Querem que Você Saiba
                </h2>

                <ul className="mt-7 space-y-4 text-[15px] text-white/86">
                  <li className="flex items-start gap-3">
                    <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7ee02a]/14 text-[11px] font-black text-[#95ef24]">
                      ✓
                    </span>
                    <span>Aproveite promoções que já existem</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7ee02a]/14 text-[11px] font-black text-[#95ef24]">
                      ✓
                    </span>
                    <span>Use estratégias matemáticas comprovadas</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7ee02a]/14 text-[11px] font-black text-[#95ef24]">
                      ✓
                    </span>
                    <span>Multiplique seus ganhos com múltiplas</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7ee02a]/14 text-[11px] font-black text-[#95ef24]">
                      ✓
                    </span>
                    <span>Transforme bônus em dinheiro real</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7ee02a]/14 text-[11px] font-black text-[#95ef24]">
                      ✓
                    </span>
                    <span>Métodos testados e validados</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#08111b_0%,#09111a_100%)] py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.04),transparent_10%),radial-gradient(circle_at_84%_72%,rgba(126,224,42,0.04),transparent_18%)]" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#7cd81d]/18 bg-[#0d1d10]/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#95ef24]">
                <span className="mr-2.5 h-2 w-2 rounded-full bg-[#95ef24]" />
                ALUNOS SATISFEITOS
              </div>

              <h2 className="mt-5 text-[27px] font-bold tracking-[-0.04em] md:text-[34px]">
                <span className="italic text-[#7ee02a]">Resultados Reais</span>{" "}
                <span className="italic text-white/92">
                  de Quem Aplicou o Método
                </span>
              </h2>
            </div>

            {totalTestimonials > 3 && (
              <div className="hidden items-center gap-3 md:flex">
                <button
                  type="button"
                  onClick={prevTestimonials}
                  aria-label="Depoimento anterior"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-[#101722] text-[20px] text-white/90 transition hover:border-[#86e11f]/40 hover:text-white"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={nextTestimonials}
                  aria-label="Próximo depoimento"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-[#101722] text-[20px] text-white/90 transition hover:border-[#86e11f]/40 hover:text-white"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {visibleTestimonials.map((item, idx) => (
              <div
                key={`${item.name}-${testimonialIndex}-${idx}`}
                className="rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,20,30,0.90)_0%,rgba(10,15,23,0.94)_100%)] px-5 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.14)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#53c84f] text-[18px] font-extrabold text-white">
                    {item.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[17px] font-extrabold leading-none text-white">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-[12px] font-medium text-white/58">
                          {item.city}
                        </p>
                      </div>

                      <div className="pt-0.5 text-[15px] leading-none tracking-[0.08em] text-[#ffbf3f]">
                        ★★★★★
                      </div>
                    </div>

                    <p className="mt-4 max-w-[300px] text-[14px] leading-[1.45] text-white/72">
                      “{item.text}”
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalTestimonials > 3 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              {Array.from({ length: totalTestimonials }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setTestimonialIndex(index)}
                  aria-label={`Ir para depoimento ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    index === testimonialIndex
                      ? "w-7 bg-[#86e11f]"
                      : "w-2.5 bg-white/24 hover:bg-white/36"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="cta" className="bg-[#050b12] py-5">
        <div className="mx-auto max-w-[1180px] px-8">
          <div className="rounded-[22px] border border-[#7ee02a]/45 bg-[linear-gradient(180deg,#07120c_0%,#071019_100%)] px-10 py-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-[640px]">
              <h2 className="text-[26px] font-black italic leading-[1.02] tracking-[-0.04em] text-white md:text-[38px]">
                Pronto para{" "}
                <span className="text-[#7ee02a]">Começar a Faturar?</span>
              </h2>

              <p className="mt-3 text-[14px] text-white/72 md:text-[15px]">
                Junte-se a milhares de pessoas que já transformaram rodadas
                grátis em dinheiro real
              </p>

              <a
                href="#"
                className={`${primaryButtonClass} mt-5 inline-flex h-[50px] min-w-[290px] items-center justify-center px-8 text-[15px]`}
                style={{ color: "#081200", WebkitTextFillColor: "#081200" }}
              >
                QUERO COMEÇAR AGORA!
              </a>

              <div className="mt-3 text-[12px] text-white/62">
                🔒 Acesso imediato • Garantia de 7 dias • Suporte incluso
              </div>
            </div>

            <div className="mt-5 lg:mt-0 lg:w-[300px] lg:shrink-0">
              <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,35,0.96)_0%,rgba(10,15,24,0.98)_100%)] px-5 py-5 shadow-[0_12px_26px_rgba(0,0,0,0.14)]">
                <div className="absolute left-0 top-0 h-full w-[2px] bg-[linear-gradient(180deg,rgba(134,225,31,0.00)_0%,rgba(134,225,31,0.95)_50%,rgba(134,225,31,0.00)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(134,225,31,0.08),transparent_30%)]" />

                <div className="relative z-10">
                  <div className="inline-flex items-center rounded-full border border-[#86e11f]/20 bg-[#102013] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#a8ff4a]">
                    Liberação Imediata
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#86e11f]/16 text-[#a8ff4a]">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 12L10.5 14.5L16 9"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-[19px] font-extrabold leading-none text-white">
                        Acesso Imediato
                      </h3>
                      <p className="mt-2 text-[13px] leading-[1.45] text-white/68">
                        Entre agora e comece a aplicar o método sem espera.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#04080e] py-4">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-8 text-[12px] text-white/52 lg:flex-row">
          <div className="flex items-center gap-3">
            <div className="text-[32px] font-black leading-none text-[#97f21f]">
              α
            </div>
            <div className="text-[16px] font-extrabold tracking-[-0.02em] text-white">
              ALPHA <span className="text-[#79db21]">TIPS</span>
            </div>
          </div>

          <div>© 2024 Alpha Tips. Todos os direitos reservados.</div>

          <div className="flex gap-6">
            <a href="#" className="transition hover:text-white">
              Termos de Uso
            </a>
            <a href="#" className="transition hover:text-white">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}