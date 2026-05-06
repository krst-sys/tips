"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  FileImage,
  Heart,
  ImageUp,
  LockKeyhole,
  MessageSquare,
  Send,
  Share2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

const CURRENT_USER = {
  id: "thyago",
  name: "Thyago",
  initials: "AT",
  premium: true,
};

const FEED_FILTERS = [
  { label: "Recentes", value: "recent" },
  { label: "Mais curtidos", value: "liked" },
  { label: "Comentados", value: "commented" },
  { label: "Meus bilhetes", value: "mine" },
];

const INITIAL_POSTS = [
  {
    id: "ticket-001",
    author: { id: "ana", name: "Ana Martins", initials: "AM" },
    createdAt: "Hoje, 14:18",
    caption: "Bilhete compartilhado para acompanhar a rodada com a comunidade.",
    imageSrc: "/teste1.png",
    imageWidth: 1284,
    imageHeight: 1482,
    likes: 42,
    liked: true,
    comments: [
      { id: "c1", author: "Bruno Castro", initials: "BC", time: "14:22", text: "Boa leitura no over. Peguei uma linha parecida." },
      { id: "c2", author: "Camila Rocha", initials: "CR", time: "14:31", text: "A odd subiu depois da confirmacao do time titular." },
    ],
  },
  {
    id: "ticket-002",
    author: { id: "bruno", name: "Bruno Castro", initials: "BC" },
    createdAt: "Hoje, 12:06",
    caption: "Entrada enviada no grupo premium antes do fechamento da linha.",
    imageSrc: "/teste2.png",
    imageWidth: 1080,
    imageHeight: 2143,
    likes: 36,
    liked: false,
    comments: [
      { id: "c3", author: "Elisa Nunes", initials: "EN", time: "12:19", text: "Linha de pontos faz sentido com a defesa desfalcada." },
    ],
  },
  {
    id: "ticket-003",
    author: { id: "camila", name: "Camila Rocha", initials: "CR" },
    createdAt: "Ontem, 21:44",
    caption: "Compartilhando o bilhete que usei como referencia hoje.",
    imageSrc: "/teste3.png",
    imageWidth: 1284,
    imageHeight: 2778,
    likes: 28,
    liked: false,
    comments: [
      { id: "c4", author: "Henrique Prado", initials: "HP", time: "22:01", text: "Gostei da combinacao com gols. Mercado estava bem precificado." },
      { id: "c5", author: "Ana Martins", initials: "AM", time: "22:08", text: "Stake baixa faz todo sentido aqui." },
      { id: "c6", author: "Voce", initials: "AT", time: "22:13", text: "Tambem peguei River, mas fiquei fora do over." },
    ],
  },
  {
    id: "ticket-004",
    author: { id: "elisa", name: "Elisa Nunes", initials: "EN" },
    createdAt: "Seg, 18:12",
    caption: "Bilhete simples para deixar registrado no feed premium.",
    imageSrc: "/teste4.png",
    imageWidth: 1080,
    imageHeight: 1794,
    likes: 24,
    liked: false,
    comments: [
      { id: "c7", author: "Felipe Torres", initials: "FT", time: "18:28", text: "Boa. Essa linha abriu melhor do que eu esperava." },
    ],
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900",
        className
      )}
    >
      {children}
    </section>
  );
}

function Avatar({ user, size = "md" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[13px] bg-slate-950 font-bold text-white ring-1 ring-slate-950/10 dark:bg-white dark:text-slate-950 dark:ring-white/10",
        size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-[13px]"
      )}
    >
      {user.initials}
    </span>
  );
}

function PremiumBadge() {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-2.5 py-1 text-[12px] font-semibold text-lime-800 dark:border-lime-300/20 dark:bg-lime-300/10 dark:text-lime-200">
      <Sparkles className="h-3.5 w-3.5" />
      Premium
    </span>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-[11px] px-3.5 text-[13px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-white/[0.16]",
        active
          ? "bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 dark:bg-white/[0.1] dark:text-white dark:ring-white/[0.1]"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.055] dark:hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function TicketImage({ post, large = false }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:border-white/[0.08] dark:bg-slate-950",
        large ? "max-h-[calc(92vh-40px)]" : ""
      )}
    >
      <Image
        src={post.imageSrc}
        alt={`Bilhete compartilhado por ${post.author.name}`}
        width={post.imageWidth}
        height={post.imageHeight}
        sizes={large ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 768px) 760px, 100vw"}
        className={cn(
          "mx-auto h-auto w-full bg-slate-100 object-contain dark:bg-slate-950",
          large ? "max-h-[calc(92vh-40px)]" : "max-h-[620px]"
        )}
      />
    </div>
  );
}

function ActionButton({ active, onClick, icon: Icon, children, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-[12px] px-3 text-[13px] font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-55",
        active
          ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "fill-current" : "")} />
      {children}
    </button>
  );
}

function PostCard({ post, onOpen, onLike }) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar user={post.author} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-slate-950 dark:text-white">{post.author.name}</p>
            <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{post.createdAt}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpen(post.id)}
          className="inline-flex h-9 items-center justify-center rounded-[11px] px-3 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:ring-white/[0.08] dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          Abrir
        </button>
      </div>

      <button type="button" onClick={() => onOpen(post.id)} className="block w-full px-4 text-left">
        <TicketImage post={post} />
      </button>

      <div className="p-5">
        {post.caption ? (
          <p className="text-[14px] leading-6 text-slate-700 dark:text-slate-300">{post.caption}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ActionButton active={post.liked} onClick={() => onLike(post.id)} icon={Heart}>
              {post.likes} curtidas
            </ActionButton>
            <ActionButton onClick={() => onOpen(post.id)} icon={MessageSquare}>
              {post.comments.length} comentarios
            </ActionButton>
            <ActionButton onClick={() => onOpen(post.id)} icon={Share2}>
              Compartilhar
            </ActionButton>
          </div>

          <button
            type="button"
            onClick={() => onOpen(post.id)}
            className="text-[13px] font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            Ver comentarios
          </button>
        </div>

      </div>
    </article>
  );
}

function DetailModal({ post, currentUser, onClose, onLike, onComment }) {
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim() || !currentUser.premium) return;
    onComment(post.id, message.trim());
    setMessage("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[3px] dark:bg-black/70">
      <section className="flex max-h-[92vh] w-full max-w-[1160px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] dark:border-white/[0.09] dark:bg-[#0d1522] lg:grid lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-h-0 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-950 sm:p-4 lg:p-5">
          <TicketImage post={post} large />
        </div>

        <aside className="flex min-h-0 flex-col border-t border-slate-200 bg-white dark:border-white/[0.08] dark:bg-slate-900 lg:border-l lg:border-t-0">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/[0.08]">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar user={post.author} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-slate-950 dark:text-white">{post.author.name}</p>
                <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{post.createdAt}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {post.caption ? (
              <div className="rounded-[15px] bg-slate-50 p-3 dark:bg-white/[0.035]">
                <p className="text-[14px] leading-6 text-slate-700 dark:text-slate-300">{post.caption}</p>
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar user={{ initials: comment.initials }} size="sm" />
                    <div className="min-w-0 flex-1 rounded-[14px] bg-slate-50 px-3 py-2.5 dark:bg-white/[0.035]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[13px] font-semibold text-slate-950 dark:text-white">{comment.author}</p>
                        <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">{comment.time}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4 text-[13px] leading-5 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-300">
                  Nenhum comentario ainda.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 p-4 dark:border-white/[0.08]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <ActionButton active={post.liked} onClick={() => onLike(post.id)} icon={Heart}>
                {post.likes} curtidas
              </ActionButton>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-[12px] px-3 text-[13px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:ring-white/[0.08] dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                {post.comments.length} comentarios
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escreva um comentario"
                className="h-11 min-w-0 flex-1 rounded-[13px] border border-slate-200 bg-white px-3 text-[13px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:border-white/[0.16] dark:focus:ring-white/[0.08]"
              />
              <button type="submit" disabled={!message.trim()} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" aria-label="Enviar comentario">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SubmitModal({ onClose, onSubmit }) {
  const [caption, setCaption] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(caption);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[3px] dark:bg-black/70">
      <form onSubmit={handleSubmit} className="w-full max-w-[560px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] dark:border-white/[0.09] dark:bg-[#0d1522]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/[0.08]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Novo post</p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.035em] text-slate-950 dark:text-white">Enviar bilhete</h2>
            <p className="mt-2 max-w-[420px] text-[13px] leading-5 text-slate-600 dark:text-slate-300">
              Seu bilhete sera revisado antes de aparecer na comunidade.
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <label className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-slate-400 hover:bg-white dark:border-white/[0.14] dark:bg-white/[0.035] dark:hover:bg-white/[0.055]">
            <ImageUp className="h-7 w-7 text-slate-400 dark:text-slate-500" />
            <span className="mt-3 text-[14px] font-semibold text-slate-950 dark:text-white">Imagem do bilhete</span>
            <span className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">PNG, JPG ou captura de tela legivel</span>
            <input type="file" accept="image/*" className="sr-only" />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Legenda opcional</span>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={4}
              placeholder="Adicione um contexto curto para a comunidade"
              className="resize-none rounded-[13px] border border-slate-200 bg-white px-3 py-3 text-[13px] leading-5 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:ring-white/[0.08]"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 dark:border-white/[0.08] sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[13px] bg-white px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]">
            Cancelar
          </button>
          <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">
            <Upload className="h-4 w-4" />
            Enviar bilhete
          </button>
        </div>
      </form>
    </div>
  );
}

function PremiumGate() {
  return (
    <Panel className="mx-auto w-full max-w-[860px] p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-lime-50 text-lime-800 ring-1 ring-lime-200 dark:bg-lime-300/10 dark:text-lime-200 dark:ring-lime-300/20">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Premium</p>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Bilhetes e exclusivo para assinantes</h2>
            <p className="mt-2 max-w-[600px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
              Assine para ver publicacoes, curtir e conversar com a comunidade premium.
            </p>
          </div>
        </div>
        <Link href="/area-membros/assinatura" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 sm:w-auto">
          <Sparkles className="h-4 w-4" />
          Ver planos
        </Link>
      </div>
    </Panel>
  );
}

export default function BilhetesPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [feedFilter, setFeedFilter] = useState("recent");
  const [selectedId, setSelectedId] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedPost = posts.find((post) => post.id === selectedId);

  const visiblePosts = useMemo(() => {
    const next = feedFilter === "mine" ? posts.filter((post) => post.author.id === CURRENT_USER.id) : posts.slice();

    if (feedFilter === "liked") {
      return next.sort((a, b) => b.likes - a.likes);
    }

    if (feedFilter === "commented") {
      return next.sort((a, b) => b.comments.length - a.comments.length);
    }

    return next;
  }, [feedFilter, posts]);

  function handleLike(postId) {
    if (!CURRENT_USER.premium) return;
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;
        const liked = !post.liked;
        return { ...post, liked, likes: post.likes + (liked ? 1 : -1) };
      })
    );
  }

  function handleComment(postId, text) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: `comment-${Date.now()}`,
                  author: "Voce",
                  initials: CURRENT_USER.initials,
                  time: "Agora",
                  text,
                },
              ],
            }
          : post
      )
    );
  }

  function handleSubmit(caption) {
    const newPost = {
      id: `ticket-${Date.now()}`,
      author: { id: CURRENT_USER.id, name: "Voce", initials: CURRENT_USER.initials },
      createdAt: "Agora",
      caption: caption || "Novo bilhete compartilhado com a comunidade.",
      imageSrc: "/teste1.png",
      imageWidth: 1284,
      imageHeight: 1482,
      likes: 0,
      liked: false,
      comments: [],
    };

    setPosts((current) => [newPost, ...current]);
    setSubmitOpen(false);
    setFeedFilter("mine");
    setNotice("Bilhete enviado com sucesso.");
  }

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[960px] flex-col gap-4 px-5 py-5 md:px-8">
        <header className="mx-auto w-full max-w-[760px] rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-slate-900 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">Bilhetes</h1>
                  <PremiumBadge />
                </div>
                <p className="mt-1.5 max-w-[560px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
                  Veja bilhetes compartilhados pela comunidade premium.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => CURRENT_USER.premium && setSubmitOpen(true)}
              disabled={!CURRENT_USER.premium}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[13px] bg-emerald-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 sm:w-auto"
            >
              <FileImage className="h-4 w-4" />
              Enviar bilhete
            </button>
          </div>
        </header>

        {!CURRENT_USER.premium ? (
          <PremiumGate />
        ) : (
          <>
            {notice ? (
              <div className="mx-auto flex w-full max-w-[760px] items-start gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4 text-[13px] leading-5 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{notice}</span>
              </div>
            ) : null}

            <div className="mx-auto flex w-full max-w-[760px] gap-1 overflow-x-auto rounded-[14px] border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
              {FEED_FILTERS.map((filter) => (
                <FilterButton key={filter.value} active={feedFilter === filter.value} onClick={() => setFeedFilter(filter.value)}>
                  {filter.label}
                </FilterButton>
              ))}
            </div>

            <section className="mx-auto grid w-full max-w-[760px] gap-5">
              {visiblePosts.length > 0 ? (
                visiblePosts.map((post) => (
                  <PostCard key={post.id} post={post} onOpen={setSelectedId} onLike={handleLike} />
                ))
              ) : (
                <Panel className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
                      <MessageSquare className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">Nenhum bilhete neste filtro</h2>
                      <p className="mt-2 text-[14px] leading-6 text-slate-600 dark:text-slate-300">
                        Quando voce publicar ou interagir com bilhetes, eles aparecem aqui.
                      </p>
                    </div>
                  </div>
                </Panel>
              )}
            </section>
          </>
        )}
      </div>

      {selectedPost ? (
        <DetailModal
          post={selectedPost}
          currentUser={CURRENT_USER}
          onClose={() => setSelectedId(null)}
          onLike={handleLike}
          onComment={handleComment}
        />
      ) : null}

      {submitOpen ? <SubmitModal onClose={() => setSubmitOpen(false)} onSubmit={handleSubmit} /> : null}
    </main>
  );
}
