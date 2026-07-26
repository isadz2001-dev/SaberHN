import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileTabBar, MobileTopBar, type TabKey } from "@/components/MobileTabBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { formatL, DEFAULT_CATEGORIES, type Course, type CourseLesson, type CourseTask } from "@/lib/courses";
import { Plus, Trash2, Sparkles, BookOpen, GraduationCap, UserCircle2, Check, Clock, CalendarClock, Users, Star, PlayCircle, FileText, LogOut, Search, MessageSquare, Radio, Video, Pencil, Send, X, Crown, TrendingUp, Award, BarChart3, Zap, ShoppingCart, ChevronLeft } from "lucide-react";
import { StudyTimeChart } from "@/components/StudyTimeChart";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();
  const store = useStore();
  const [tab, setTab] = useState<TabKey>("explore");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { email, fullName, age, role } = user ?? {};
  useEffect(() => {
    if (email && fullName && age && role) {
      store.upsertProfile({ email, fullName, age, role });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, fullName, age, role]);

  if (!user) return <Navigate to="/login" />;
  const isInstructor = user.role === "instructor" || user.role === "instructor_pro";
  const roleLabel = user.role === "instructor_pro" ? "Instructor Pro" : user.role === "instructor" ? "Instructor" : "Estudiante";

  if (selectedCourse) {
    return (
      <CourseDetailPage
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const titles: Record<TabKey, { t: string; s: string }> = {
    explore: { t: `Hola, ${user.fullName.split(" ")[0]}`, s: "Explora nuevos cursos" },
    learning: { t: "Mis aprendizajes", s: "Continúa donde lo dejaste" },
    teach: { t: "Mi espacio", s: "Gestiona tus cursos" },
    plans: { t: "Planes", s: "Compara y mejora" },
    profile: { t: "Mi perfil", s: roleLabel },
    blog: { t: "Blog", s: "Consejos e inspiración" },
    faq: { t: "Preguntas frecuentes", s: "Resolvemos tus dudas" },
    stories: { t: "Historias reales", s: "Testimonios de nuestra comunidad" },
  };

  return (
    <div className="app-shell flex flex-col">
      <MobileTopBar title={titles[tab].t} subtitle={titles[tab].s} onHome={() => setTab("explore")} />
      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {tab === "explore" && <ExploreTab onSelectCourse={setSelectedCourse} />}
        {tab === "learning" && <LearningTab onSelectCourse={setSelectedCourse} />}
        {tab === "teach" && isInstructor && <TeachTab />}
        {tab === "plans" && isInstructor && <PlansTab />}
        {tab === "profile" && <ProfileTab />}
        {tab === "blog" && <BlogTab />}
        {tab === "faq" && <FAQTab />}
        {tab === "stories" && <StoriesTab />}
      </main>
      <MobileTabBar active={tab} onChange={setTab} isInstructor={isInstructor} />
    </div>
  );
}

function ExploreTab({ onSelectCourse }: { onSelectCourse: (c: Course) => void }) {
  const { user } = useAuth();
  const store = useStore();
  const cart = useCart();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const all = store.allCourses();
  const categories = useMemo(() => {
    const s = new Set<string>([...DEFAULT_CATEGORIES, ...all.map(c => c.category)]);
    return Array.from(s).filter(Boolean);
  }, [all]);

  const filtered = all.filter(c => {
    const okCat = cat === "all" || c.category === cat;
    const okQ = !q || c.title.toLowerCase().includes(q.toLowerCase()) || c.instructor.toLowerCase().includes(q.toLowerCase());
    return okCat && okQ;
  }).sort((a, b) => {
    const rank = (c: Course) => c.featured && !c.builtin ? 0 : c.builtin ? 1 : 2;
    return rank(a) - rank(b);
  });

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar curso o instructor…" className="h-11 rounded-xl pl-9" />
      </div>

      {/* Category chips — horizontal scroll */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCat("all")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${cat === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          Todas
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${cat === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No encontramos cursos con esos filtros.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(c => {
            const enrolled = user ? store.isEnrolled(c.id, user.email) : false;
            const { avg, count } = store.averageRating(c.id);
            return (
              <Card key={c.id} className="overflow-hidden transition active:scale-[0.98]" onClick={() => onSelectCourse(c)}>
                <div className="relative h-36 bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }}>
                  {c.featured && !c.builtin && (
                    <span className="absolute left-2 top-2 rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-white shadow">Destacado</span>
                  )}
                  {!c.featured && !c.builtin && (
                    <span className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white shadow">Nuevo</span>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{c.category} · {c.level}</p>
                    {(avg > 0 || c.rating) && (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
                        <Star className="h-3 w-3 fill-current" />{avg > 0 ? avg.toFixed(1) : c.rating}
                        {count > 0 && <span className="text-muted-foreground">({count})</span>}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-semibold leading-tight">{c.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Por {c.instructor}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{c.hours} h</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {c.flexible ? "Flexible" : c.schedule}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-primary">{formatL(c.price)}</span>
                    {enrolled ? (
                      <span className="text-xs font-medium text-green-600">Inscrito ✓</span>
                    ) : cart.has(c.id) ? (
                      <span className="text-xs font-medium text-primary">En el carrito ✓</span>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-lg"
                        onClick={(e) => { e.stopPropagation(); cart.add(c); showToast(`"${c.title}" agregado al carrito`); }}
                      >
                        <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Agregar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function LearningTab({ onSelectCourse }: { onSelectCourse: (c: Course) => void }) {
  const { user } = useAuth();
  const store = useStore();
  if (!user) return null;
  const mine = store.allCourses().filter(c => store.isEnrolled(c.id, user.email));
  if (mine.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-medium">Aún no tienes cursos</p>
        <p className="text-sm text-muted-foreground">Explora el catálogo e inscríbete para verlos aquí.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      {mine.map(c => (
        <Card key={c.id} className="overflow-hidden transition active:scale-[0.98]" onClick={() => onSelectCourse(c)}>
          <CardContent className="flex items-center gap-3 p-3">
            <div className="h-16 w-16 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{c.category}</p>
              <p className="truncate font-semibold leading-tight">{c.title}</p>
              <p className="truncate text-xs text-muted-foreground">{c.flexible ? "Horarios flexibles" : c.schedule}</p>
              {store.live[c.id]?.active && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
                  <Radio className="h-3 w-3 animate-pulse" /> En vivo ahora
                </span>
              )}
            </div>
            <ChevronLeft className="h-5 w-5 shrink-0 rotate-180 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CourseDetailPage({ course, onBack }: { course: Course; onBack: () => void }) {
  const { user } = useAuth();
  const store = useStore();
  const cart = useCart();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState("");
  if (!user) return null;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const isEnrolled = store.isEnrolled(course.id, user.email);
  const enrolledList = store.enrollments[course.id] ?? [];
  const isOwner = course.instructorEmail === user.email;
  const comments = store.comments[course.id] ?? [];
  const live = store.live[course.id];
  const { avg, count } = store.averageRating(course.id);
  const myRating = store.ratings[course.id]?.[user.email] ?? 0;

  const submitComment = () => {
    const t = commentText.trim();
    if (!t) return;
    store.addComment({ courseId: course.id, email: user.email, name: user.fullName, text: t });
    setCommentText("");
  };

  return (
    <>
      <div className="app-shell flex flex-col">
        {/* Sticky header */}
        <header
          className="sticky top-0 z-30 px-5 pb-4 pt-12 text-white pt-safe"
          style={{ background: "linear-gradient(160deg, #5a6f90 0%, #2e3a52 100%)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 transition active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold leading-tight">{course.title}</h1>
              <p className="truncate text-xs text-white/80">{course.category} · {course.level}</p>
            </div>
            {live?.active && (
              <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold">
                <Radio className="h-3 w-3 animate-pulse" />En vivo
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-8">
          {/* Course image */}
          <div className="h-44 w-full bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }} />

          {/* Info grid */}
          <div className="m-4 grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 text-sm shadow-sm">
            <InfoCell icon={<Clock className="h-4 w-4" />} label="Duración" value={`${course.hours} h`} />
            <InfoCell icon={<CalendarClock className="h-4 w-4" />} label="Horario" value={course.flexible ? "Flexible" : course.schedule} />
            <InfoCell icon={<Users className="h-4 w-4" />} label="Estudiantes" value={`${enrolledList.length || course.students}`} />
            <InfoCell icon={<Star className="h-4 w-4" />} label="Rating" value={count > 0 ? `${avg.toFixed(1)} (${count})` : `${course.rating ?? "—"}`} />
          </div>

          {/* Enrollment preview (not enrolled, not owner) */}
          {!isEnrolled && !isOwner && (
            <div className="m-4 space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{course.longDescription}</p>
              <div>
                <h4 className="text-sm font-semibold">Lo que aprenderás</h4>
                <ul className="mt-2 grid gap-1.5">
                  {course.learnings.map(l => (
                    <li key={l} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{l}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Requisitos</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {course.requirements.map(r => <li key={r}>{r}</li>)}
                </ul>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-2xl font-bold text-primary">{formatL(course.price)}</span>
                <div className="flex gap-2">
                  {!cart.has(course.id) && (
                    <Button variant="outline" onClick={() => { cart.add(course); showToast(`"${course.title}" agregado al carrito`); }}>
                      <ShoppingCart className="mr-1.5 h-4 w-4" /> Carrito
                    </Button>
                  )}
                  <Button onClick={() => { store.enroll(course.id, user.email); showToast(`Te inscribiste a "${course.title}"`); }}>
                    Inscribirme ahora
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs (enrolled or owner) */}
          {(isEnrolled || isOwner) && (
          <div className="px-4">
            <Tabs defaultValue="content">
              <div className="no-scrollbar overflow-x-auto">
                <TabsList className="w-max min-w-full justify-start">
                  <TabsTrigger value="content"><PlayCircle className="mr-1.5 h-4 w-4" />Contenido</TabsTrigger>
                  <TabsTrigger value="videos"><Video className="mr-1.5 h-4 w-4" />Videos</TabsTrigger>
                  <TabsTrigger value="tasks"><FileText className="mr-1.5 h-4 w-4" />Tareas</TabsTrigger>
                  <TabsTrigger value="live"><Radio className="mr-1.5 h-4 w-4" />Clase en vivo</TabsTrigger>
                  <TabsTrigger value="comments"><MessageSquare className="mr-1.5 h-4 w-4" />Foro</TabsTrigger>
                  <TabsTrigger value="rate"><Star className="mr-1.5 h-4 w-4" />Valoración</TabsTrigger>
                  {isOwner && <TabsTrigger value="students"><Users className="mr-1.5 h-4 w-4" />Estudiantes</TabsTrigger>}
                  <TabsTrigger value="about">Info</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="content" className="mt-4 space-y-2">
                {course.lessons.map((l, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{l.title}</p>
                        <p className="text-xs text-muted-foreground">{l.duration}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">Ver</Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="videos" className="mt-4 grid grid-cols-1 gap-3">
                {course.lessons.map((l, i) => (
                  <div key={i} className="overflow-hidden rounded-lg border">
                    <div className="grid aspect-video place-items-center bg-muted text-primary">
                      <PlayCircle className="h-10 w-10" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.duration}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="tasks" className="mt-4 space-y-3">
                {course.tasks.map((t, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{t.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">Entrega en {t.dueInDays}d</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3">Entregar tarea</Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="live" className="mt-4">
                <LivePanel course={course} isOwner={isOwner} />
              </TabsContent>

              <TabsContent value="comments" className="mt-4 space-y-3">
                <div className="rounded-lg border p-3">
                  <Textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Escribe un comentario o pregunta…"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={submitComment}><Send className="mr-1.5 h-3.5 w-3.5" />Publicar</Button>
                  </div>
                </div>
                {comments.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">Sé el primero en comentar.</p>
                )}
                {comments.slice().reverse().map(c => (
                  <div key={c.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{c.name} {c.email === course.instructorEmail && <Badge variant="secondary" className="ml-1">Instructor</Badge>}</p>
                        <p className="text-xs text-muted-foreground">{new Date(c.at).toLocaleString("es-HN")}</p>
                      </div>
                      {(isOwner || c.email === user.email) && (
                        <Button size="icon" variant="ghost" onClick={() => store.removeComment(course.id, c.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-2 text-sm">{c.text}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="rate" className="mt-4">
                <RatingPanel courseId={course.id} isOwner={isOwner} myRating={myRating} avg={avg} count={count} />
              </TabsContent>

              {isOwner && (
                <TabsContent value="students" className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">{enrolledList.length} estudiante(s) inscritos</p>
                  {enrolledList.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay estudiantes inscritos.</p>}
                  {enrolledList.map(email => {
                    const p = store.profiles[email];
                    return (
                      <div key={email} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-muted"><UserCircle2 className="h-6 w-6" /></div>
                          <div>
                            <p className="text-sm font-medium">{p?.fullName ?? email}</p>
                            <p className="text-xs text-muted-foreground">{email}{p?.age ? ` · ${p.age} años` : ""}</p>
                          </div>
                        </div>
                        <RemoveStudentButton courseId={course.id} email={email} name={p?.fullName ?? email} />
                      </div>
                    );
                  })}
                </TabsContent>
              )}

              <TabsContent value="about" className="mt-4 space-y-3 text-sm">
                <p className="text-muted-foreground">{course.longDescription}</p>
                <div>
                  <h4 className="font-semibold">Instructor</h4>
                  <p className="text-muted-foreground">{course.instructor} — {course.instructorBio}</p>
                </div>
              </TabsContent>

              {isEnrolled && !isOwner && (
                <div className="mt-6">
                  <Button variant="destructive" className="w-full" onClick={() => setConfirmLeave(true)}>
                    <LogOut className="mr-2 h-4 w-4" />Darme de baja del curso
                  </Button>
                </div>
              )}
            </Tabs>
          </div>
          )}
        </main>
      </div>

      <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de darte de baja del curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderás el acceso a los contenidos, videos y tareas de <strong>{course.title}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { store.unenroll(course.id, user.email); setConfirmLeave(false); onBack(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, darme de baja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function RemoveStudentButton({ courseId, email, name }: { courseId: string; email: string; name: string }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Dar de baja</Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja a {name}?</AlertDialogTitle>
            <AlertDialogDescription>El estudiante perderá acceso al curso.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { store.unenroll(courseId, email); setOpen(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, dar de baja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LivePanel({ course, isOwner }: { course: Course; isOwner: boolean }) {
  const store = useStore();
  const live = store.live[course.id] ?? { active: false };
  const [topic, setTopic] = useState(live.topic ?? "");
  const [url, setUrl] = useState(live.url ?? "");

  if (isOwner) {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-semibold">Iniciar tu clase en vivo</p>
        <div className="space-y-1.5"><Label>Tema de hoy</Label>
          <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ej. Rasgueos básicos" />
        </div>
        <div className="space-y-1.5"><Label>Enlace de la sesión (Zoom, Meet, etc.)</Label>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="flex gap-2">
          {!live.active ? (
            <Button onClick={() => store.setLive(course.id, { active: true, topic, url, startedAt: Date.now() })}>
              <Radio className="mr-2 h-4 w-4" />Iniciar clase
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => store.setLive(course.id, { ...live, active: false })}>
              Finalizar clase
            </Button>
          )}
        </div>
        {live.active && <p className="text-sm text-green-700">✓ Clase activa. Los estudiantes ya la ven.</p>}
      </div>
    );
  }
  if (!live.active) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Radio className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No hay clase en vivo por ahora. Te avisaremos cuando el instructor la inicie.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4">
      <div className="flex items-center gap-2 text-red-700"><Radio className="h-4 w-4 animate-pulse" /><span className="text-sm font-semibold">EN VIVO</span></div>
      <p className="mt-2 font-semibold">{live.topic || "Clase en curso"}</p>
      {live.url && (
        <a href={live.url} target="_blank" rel="noreferrer">
          <Button className="mt-3"><Video className="mr-2 h-4 w-4" />Unirme a la clase</Button>
        </a>
      )}
    </div>
  );
}

function RatingPanel({ courseId, isOwner, myRating, avg, count }: { courseId: string; isOwner: boolean; myRating: number; avg: number; count: number }) {
  const { user } = useAuth();
  const store = useStore();
  const [hover, setHover] = useState(0);
  if (!user) return null;
  const rows = Object.entries(store.ratings[courseId] ?? {});

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 text-center">
        <p className="text-4xl font-bold">{count > 0 ? avg.toFixed(1) : "—"}</p>
        <p className="text-xs text-muted-foreground">{count} valoración(es)</p>
      </div>
      {!isOwner && (
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm font-medium">Tu valoración</p>
          <div className="mt-2 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                onClick={() => store.setRating(courseId, user.email, n)}>
                <Star className={`h-8 w-8 ${n <= (hover || myRating) ? "fill-slate-800 text-slate-800" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          {myRating > 0 && <p className="mt-2 text-xs text-muted-foreground">Diste {myRating} de 5</p>}
        </div>
      )}
      {isOwner && (
        <div>
          <p className="mb-2 text-sm font-semibold">Quiénes han valorado</p>
          {rows.length === 0 && <p className="text-sm text-muted-foreground">Aún nadie valoró el curso.</p>}
          <div className="space-y-2">
            {rows.map(([email, score]) => {
              const p = store.profiles[email];
              return (
                <div key={email} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{p?.fullName ?? email}</p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    {Array.from({ length: score }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

// ----------------- Teach Tab -----------------

const BLANK_COURSE = (): Omit<Course, "id"> => ({
  title: "", category: "Otro", instructor: "", instructorBio: "",
  price: 250, hours: 8, level: "Principiante",
  description: "", longDescription: "",
  image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=70",
  rating: undefined, students: 0,
  schedule: "Horarios flexibles", flexible: true, language: "Español",
  requirements: [], learnings: [],
  lessons: [], tasks: [],
});

function TeachTab() {
  const { user, upgradeToPro } = useAuth();
  const store = useStore();
  const [editing, setEditing] = useState<Course | null>(null);
  if (!user) return null;
  const isPro = user.role === "instructor_pro";
  const mine = store.customCourses.filter(c => c.instructorEmail === user.email);

  const startNew = () => {
    const c: Course = {
      ...BLANK_COURSE(),
      id: crypto.randomUUID(),
      instructor: user.fullName,
      instructorEmail: user.email,
      instructorBio: "Instructor de El Saber HN",
      featured: isPro,
    };
    setEditing(c);
  };

  const totalStudents = mine.reduce((acc, c) => acc + (store.enrollments[c.id]?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <StudyTimeChart
        title={isPro ? "Tiempo de estudio de tus alumnos" : "Actividad de estudiantes en la plataforma"}
        subtitle={isPro ? `Monitoreo en vivo · ${totalStudents} alumno(s) en tus cursos` : "Nivel de actividad de los estudiantes (datos generales)"}
        base={isPro ? 45 : 18}
        variance={isPro ? 25 : 12}
        accent={isPro ? "#f59e0b" : "#3b82f6"}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Mis cursos ({mine.length})</h2>
        <Button size="sm" onClick={startNew}><Plus className="mr-1.5 h-4 w-4" />Nuevo</Button>
      </div>

      {mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Aún no has publicado cursos.
        </div>
      ) : (
        <div className="grid gap-3">
          {mine.map(c => {
            const students = store.enrollments[c.id]?.length ?? 0;
            const { avg, count } = store.averageRating(c.id);
            return (
              <Card key={c.id}>
                <div className="relative h-28 rounded-t-lg bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }}>
                  {c.featured && (
                    <span className="absolute left-2 top-2 rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-white shadow">Destacado</span>
                  )}
                  {!c.featured && (
                    <span className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white shadow">Nuevo</span>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{c.category}</p>
                  <p className="truncate font-semibold">{c.title}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{students}</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" />{count > 0 ? avg.toFixed(1) : "—"} ({count})</span>
                    <span className="font-semibold text-primary">{formatL(c.price)}</span>
                  </div>
                  {isPro && (
                    <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><BarChart3 className="h-3 w-3" />{students} alumno(s) inscrito(s)</span>
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(c)}><Pencil className="mr-1 h-3.5 w-3.5" />Editar</Button>
                    <Button size="icon" variant="ghost" onClick={() => store.removeCourse(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {editing && <CourseEditor course={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CourseEditor({ course, onClose }: { course: Course; onClose: () => void }) {
  const store = useStore();
  const [c, setC] = useState<Course>(course);
  const exists = store.customCourses.some(x => x.id === course.id);
  const set = <K extends keyof Course>(k: K, v: Course[K]) => setC(p => ({ ...p, [k]: v }));

  const save = () => {
    if (!c.title.trim()) return;
    if (exists) store.updateCourse(c.id, c);
    else store.addCourse(c);
    onClose();
  };

  const handleImage = (f: File) => {
    const r = new FileReader();
    r.onload = () => set("image", r.result as string);
    r.readAsDataURL(f);
  };

  const addLesson = () => set("lessons", [...c.lessons, { title: "Nueva lección", duration: "20 min" }]);
  const updLesson = (i: number, patch: Partial<CourseLesson>) => set("lessons", c.lessons.map((l, ix) => ix === i ? { ...l, ...patch } : l));
  const delLesson = (i: number) => set("lessons", c.lessons.filter((_, ix) => ix !== i));

  const addTask = () => set("tasks", [...c.tasks, { title: "Nueva tarea", description: "", dueInDays: 7 }]);
  const updTask = (i: number, patch: Partial<CourseTask>) => set("tasks", c.tasks.map((t, ix) => ix === i ? { ...t, ...patch } : t));
  const delTask = (i: number) => set("tasks", c.tasks.filter((_, ix) => ix !== i));

  const listInput = (arr: string[], onChange: (v: string[]) => void, ph: string) => (
    <div className="space-y-2">
      {arr.map((v, i) => (
        <div key={i} className="flex gap-2">
          <Input value={v} onChange={e => onChange(arr.map((x, ix) => ix === i ? e.target.value : x))} />
          <Button size="icon" variant="ghost" onClick={() => onChange(arr.filter((_, ix) => ix !== i))}><X className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange([...arr, ph])}><Plus className="mr-1 h-3 w-3" />Añadir</Button>
    </div>
  );

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{exists ? "Editar curso" : "Nuevo curso"}</DialogTitle>
          <DialogDescription>Diseña cada apartado a tu gusto.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="learn">Aprenderás / Requisitos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-3">
            <div className="space-y-1.5"><Label>Imagen del curso</Label>
              <div className="flex flex-col gap-3">
                <div className="h-32 w-full rounded-lg border bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
                <div className="space-y-2">
                  <Input value={c.image} onChange={e => set("image", e.target.value)} placeholder="URL de imagen" className="h-10 rounded-lg" />
                  <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} className="h-10 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="space-y-1.5"><Label>Título</Label><Input value={c.title} onChange={e => set("title", e.target.value)} maxLength={80} className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Categoría</Label>
                <Input value={c.category} onChange={e => set("category", e.target.value)} maxLength={40} placeholder="Ej. Diseño" list="cats" className="h-11 rounded-xl" />
                <datalist id="cats">{DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat} />)}</datalist>
              </div>
              <div className="space-y-1.5"><Label>Precio (Lempiras)</Label><Input type="number" min={0} value={c.price} onChange={e => set("price", parseInt(e.target.value || "0", 10))} className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Duración (horas)</Label><Input type="number" min={1} value={c.hours} onChange={e => set("hours", parseInt(e.target.value || "1", 10))} className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Nivel de dificultad</Label>
                <Select value={c.level} onValueChange={v => set("level", v as Course["level"])}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Principiante">Principiante</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Horario</Label><Input value={c.schedule} onChange={e => set("schedule", e.target.value)} className="h-11 rounded-xl" /></div>
              <label className="flex items-center gap-2 pt-2 text-sm">
                <input type="checkbox" checked={c.flexible} onChange={e => set("flexible", e.target.checked)} className="h-4 w-4" /> Horarios flexibles
              </label>
              <div className="space-y-1.5"><Label>Idioma</Label><Input value={c.language} onChange={e => set("language", e.target.value)} className="h-11 rounded-xl" /></div>
            </div>
            <div className="space-y-1.5"><Label>Descripción corta</Label><Input value={c.description} onChange={e => set("description", e.target.value)} maxLength={140} className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Descripción larga</Label><Textarea rows={3} value={c.longDescription} onChange={e => set("longDescription", e.target.value)} maxLength={500} className="rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Bio del instructor</Label><Textarea rows={2} value={c.instructorBio} onChange={e => set("instructorBio", e.target.value)} maxLength={200} className="rounded-lg" /></div>
          </TabsContent>

          <TabsContent value="content" className="mt-4 space-y-2">
            {c.lessons.map((l, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-2">
                <div className="flex gap-2">
                  <Input value={l.title} onChange={e => updLesson(i, { title: e.target.value })} placeholder="Título de la lección" className="h-10 rounded-lg" />
                  <Button size="icon" variant="ghost" className="shrink-0" onClick={() => delLesson(i)}><X className="h-4 w-4" /></Button>
                </div>
                <Input value={l.duration} onChange={e => updLesson(i, { duration: e.target.value })} placeholder="Duración: 20 min" className="h-10 rounded-lg" />
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addLesson}><Plus className="mr-1 h-3 w-3" />Añadir lección</Button>
          </TabsContent>

          <TabsContent value="videos" className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Añade URLs de video a cada lección.</p>
            {c.lessons.map((l, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-2">
                <p className="truncate text-sm font-medium">{l.title}</p>
                <Input value={l.videoUrl ?? ""} onChange={e => updLesson(i, { videoUrl: e.target.value })} placeholder="https://…" className="h-10 rounded-lg" />
              </div>
            ))}
            {c.lessons.length === 0 && <p className="text-sm text-muted-foreground">Agrega lecciones en la pestaña Contenido.</p>}
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-3">
            {c.tasks.map((t, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-start gap-2">
                  <Input value={t.title} onChange={e => updTask(i, { title: e.target.value })} placeholder="Título" className="h-10 rounded-lg" />
                  <Button size="icon" variant="ghost" className="shrink-0" onClick={() => delTask(i)}><X className="h-4 w-4" /></Button>
                </div>
                <Input type="number" min={1} value={t.dueInDays} onChange={e => updTask(i, { dueInDays: parseInt(e.target.value || '1', 10) })} placeholder="Días para entregar" className="h-10 rounded-lg" />
                <Textarea rows={2} value={t.description} onChange={e => updTask(i, { description: e.target.value })} placeholder="Descripción" className="rounded-lg" />
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addTask}><Plus className="mr-1 h-3 w-3" />Añadir tarea</Button>
          </TabsContent>

          <TabsContent value="learn" className="mt-4 space-y-4">
            <div><Label className="mb-2 block">Lo que aprenderás</Label>{listInput(c.learnings, v => set("learnings", v), "Nuevo aprendizaje")}</div>
            <div><Label className="mb-2 block">Requisitos</Label>{listInput(c.requirements, v => set("requirements", v), "Nuevo requisito")}</div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button variant="ghost" onClick={onClose} className="w-full">Cancelar</Button>
          <Button onClick={save} className="w-full"><Check className="mr-2 h-4 w-4" />{exists ? "Guardar cambios" : "Publicar curso"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----------------- Plans Tab -----------------

function PlansTab() {
  const { user, upgradeToPro, downgradeToNormal } = useAuth();
  if (!user) return null;
  const isPro = user.role === "instructor_pro";

  const freeFeatures = [
    "Publicar cursos ilimitados",
    "Etiqueta “Nuevo” en tus cursos",
    "Editor básico de lecciones",
    "Foro de cada curso",
    "Clases en vivo",
  ];
  const proFeatures = [
    "Destaca entre los demás instructores",
    "Prioridad en búsquedas",
    "Videos pregrabados ilimitados",
    "Estadísticas detalladas de alumnos",
    "Insignia \u201CPro\u201D en tu perfil",
    "Soporte prioritario",
  ];

  const togglePro = () => {
    if (isPro) downgradeToNormal();
    else upgradeToPro();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Compara tus planes</h2>
        <p className="mt-1 text-sm text-muted-foreground">Mira lo que ganas al pasar al plan Pro.</p>
      </div>

      <div className="grid gap-4">
        {/* Plan Gratis */}
        <Card className={isPro ? "opacity-60" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-muted"><BookOpen className="h-5 w-5" /></div>
              <div>
                <p className="text-lg font-semibold">Instructor Normal</p>
                <p className="text-xs text-muted-foreground">Tu plan actual</p>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold">Gratis</p>
            <p className="text-sm text-muted-foreground">Sin costo mensual</p>
            <ul className="mt-5 space-y-2.5">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />{f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <Badge variant="secondary" className="mt-5">Plan anterior</Badge>
            ) : (
              <Badge variant="secondary" className="mt-5">Plan activo</Badge>
            )}
          </CardContent>
        </Card>

        {/* Plan Pro */}
        <Card className={isPro ? "border-primary" : "border-slate-400/60"}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-700"><Crown className="h-5 w-5" /></div>
              <div>
                <p className="text-lg font-semibold">Instructor Pro</p>
                <p className="text-xs text-muted-foreground">Destaca entre los demás y accede a herramientas premium</p>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <p className="text-3xl font-bold">{formatL(250)}</p>
              <p className="text-sm text-muted-foreground">/mes</p>
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              <Zap className="h-3 w-3" />3 meses gratis de prueba
            </p>
            <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-400/40 bg-slate-100 p-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-sm font-semibold">Plan Pro {isPro ? "activo" : "inactivo"}</p>
                  <p className="text-xs text-muted-foreground">Enciende para ver todos los beneficios</p>
                </div>
              </div>
              <Switch checked={isPro} onCheckedChange={togglePro} />
            </div>
            <div className={`mt-4 transition-all duration-300 ${isPro ? "opacity-100 max-h-[600px]" : "opacity-0 max-h-0 overflow-hidden"}`}>
              <ul className="space-y-2.5">
                {proFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />{f}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isPro && (
        <div className="rounded-lg border border-slate-400/40 bg-slate-100 p-4 text-sm text-slate-800">
          <p className="font-medium"><TrendingUp className="mr-1.5 inline h-4 w-4" />¿Por qué pasar a Pro?</p>
          <p className="mt-1 text-slate-700">Tus cursos aparecerán con la etiqueta <strong className="text-slate-800">Destacado</strong> en gris y se mostrarán en los primeros lugares del catálogo. Los instructores normales solo reciben la etiqueta <strong className="text-slate-600">Nuevo</strong> y aparecen al final. Además, tendrás acceso a estadísticas detalladas de tus alumnos.</p>
        </div>
      )}

      {isPro && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium"><Award className="h-4 w-4 text-slate-600" />Tu plan Pro está activo</p>
          <p className="mt-1 text-xs text-muted-foreground">Tus cursos se publican con etiqueta “Destacado”, aparecen en los primeros lugares y tienes acceso a estadísticas de alumnos.</p>
        </div>
      )}
    </div>
  );
}

// ----------------- Profile Tab -----------------

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [age, setAge] = useState(String(user?.age ?? ""));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSaved(false);
    const trimmed = fullName.trim();
    if (trimmed.length < 3 || trimmed.length > 60) return setError("El nombre debe tener entre 3 y 60 caracteres.");
    const ageNum = parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < 10 || ageNum > 100) return setError("La edad debe estar entre 10 y 100 años.");
    if (password.length > 0) {
      if (password.length < 6 || password.length > 40) return setError("La contraseña debe tener entre 6 y 40 caracteres.");
      if (password !== confirm) return setError("Las contraseñas no coinciden.");
    }
    const res = updateProfile({ fullName: trimmed, age: ageNum, password: password || undefined });
    if (!res.ok) return setError(res.error ?? "No se pudo actualizar el perfil.");
    setPassword(""); setConfirm(""); setSaved(true);
  };

  const roleLabel = user.role === "instructor_pro" ? "Instructor Pro" : user.role === "instructor" ? "Instructor" : "Estudiante";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full text-primary" style={{ background: "var(--brand-soft)" }}>
            <UserCircle2 className="h-10 w-10" />
          </div>
          <div>
            <p className="font-semibold">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant="secondary">{roleLabel}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold">Editar mi perfil</h2>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="space-y-1.5"><Label>Correo electrónico</Label><Input value={user.email} disabled className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Nombre completo</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} maxLength={60} className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Edad</Label><Input type="number" min={10} max={100} value={age} onChange={e => setAge(e.target.value)} className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Nueva contraseña</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} maxLength={40} placeholder="Dejar vacío para no cambiar" className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Confirmar contraseña</Label><Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} maxLength={40} className="h-11 rounded-xl" /></div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {saved && <p className="flex items-center gap-1.5 text-sm font-medium text-primary"><Check className="h-4 w-4" />Perfil actualizado correctamente.</p>}
            <Button type="submit" className="h-11 w-full rounded-xl">Guardar cambios</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Blog                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

const BLOG_POSTS = [
  {
    id: "b1",
    title: "5 habilidades que todo estudiante online debe dominar",
    excerpt: "La autodisciplina, la gestión del tiempo y la organización son claves para aprender por internet. Aquí te contamos cómo desarrollarlas.",
    date: "15 Jul 2025",
    readTime: "5 min",
    tag: "Educación",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "b2",
    title: "Cómo el inglés abre puertas en los call centers de Honduras",
    excerpt: "El sector de call centers sigue creciendo en Honduras. Descubre por qué el inglés conversacional es la habilidad más demandada.",
    date: "8 Jul 2025",
    readTime: "4 min",
    tag: "Empleabilidad",
    image: "https://images.unsplash.com/photo-1556761175-5972dc588f6f?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "b3",
    title: "Reparación de celulares: un oficio con alta demanda",
    excerpt: "Cada vez más personas necesitan técnicos de confianza. Conoce cómo convertirte en uno y empezar a generar ingresos.",
    date: "1 Jul 2025",
    readTime: "6 min",
    tag: "Oficios",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "b4",
    title: "Marketing digital para pequeñas empresas hondureñas",
    excerpt: "Si tienes un negocio, el marketing digital puede ayudarte a llegar a más clientes sin gastar una fortuna. Te explicamos por dónde empezar.",
    date: "24 Jun 2025",
    readTime: "7 min",
    tag: "Negocios",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=70",
  },
];

function BlogTab() {
  return (
    <div className="space-y-4">
      {BLOG_POSTS.map(post => (
        <Card key={post.id} className="overflow-hidden transition active:scale-[0.98]">
          <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${post.image})` }} />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{post.tag}</span>
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime} de lectura</span>
            </div>
            <h3 className="mt-2 font-semibold leading-tight">{post.title}</h3>
            <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FAQ                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "¿Cómo me inscribo a un curso?",
    a: "Explora el catálogo en la pestaña \"Explorar\", toca un curso para ver los detalles y presiona \"Agregar\" para incluirlo en tu carrito. Luego ve al carrito y finaliza la compra para inscribirte.",
  },
  {
    q: "¿Los cursos tienen horarios fijos?",
    a: "Algunos cursos tienen horarios fijos (se muestran en la tarjeta del curso) y otros son flexibles, lo que significa que puedes avanzar a tu propio ritmo cuando tengas tiempo.",
  },
  {
    q: "¿Necesito experiencia previa?",
    a: "Cada curso indica su nivel: Principiante, Intermedio o Avanzado. Los cursos de nivel Principiante no requieren experiencia previa. Revisa los requisitos en la descripción del curso.",
  },
  {
    q: "¿Cómo me convierto en instructor?",
    a: "Al registrarte, selecciona el tipo de cuenta \"Maestro / Instructor\". Podrás crear y publicar cursos. Si quieres beneficios adicionales, activa el plan Instructor Pro por L. 250 al mes.",
  },
  {
    q: "¿Qué es Instructor Pro y vale la pena?",
    a: "Instructor Pro cuesta L. 250 al mes y te da: prioridad en búsquedas, videos pregrabados ilimitados, estadísticas detalladas de alumnos, insignia \"Pro\" en tu perfil y soporte prioritario. Es ideal si quieres enseñar profesionalmente.",
  },
  {
    q: "¿Puedo cancelar mi suscripción Pro?",
    a: "Sí, puedes cancelar cuando quieras desde la pestaña \"Planes\". Al cancelar, los beneficios Pro se desactivan al final del período pagado, pero tus cursos publicados permanecen activos.",
  },
  {
    q: "¿Cómo funcionan los pagos?",
    a: "Los pagos se procesan de forma segura a través del carrito de compras. Aceptamos tarjetas de crédito y débito. Una vez completado el pago, el curso se agrega automáticamente a \"Mis cursos\".",
  },
  {
    q: "¿Qué pasa si tengo problemas técnicos?",
    a: "Puedes escribirnos desde la pestaña de perfil. Los instructores Pro reciben soporte prioritario, pero todos los usuarios reciben respuesta en menos de 48 horas.",
  },
];

function FAQTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Tienes dudas? Aquí encontrarás las respuestas a las preguntas más comunes.
        </p>
      </div>
      <Accordion type="single" collapsible className="rounded-2xl border bg-card px-2">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b last:border-b-0">
            <AccordionTrigger className="px-3 text-left text-sm font-semibold">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="px-3 text-sm text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Historias reales                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

const STORIES = [
  {
    name: "María José Rivera",
    age: 24,
    city: "Tegucigalpa",
    course: "Inglés para call centers",
    quote: "Gracias a este curso conseguí trabajo en un call center y duplicé mi salario. La práctica con escenarios reales me dio la confianza que me faltaba.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=70",
    rating: 5,
  },
  {
    name: "Carlos Antonio Mendoza",
    age: 31,
    city: "San Pedro Sula",
    course: "Reparación de celulares",
    quote: "Abrí mi propio taller de reparación hace 6 meses. Lo que aprendí en el curso me dio las bases para empezar a generar ingresos por mi cuenta.",
    image: "https://images.unsplash.com/photo-1500648766894-ccff664a183f?auto=format&fit=crop&w=400&q=70",
    rating: 5,
  },
  {
    name: "Evelyn Saavedra",
    age: 28,
    city: "La Ceiba",
    course: "Diseño gráfico con Canva",
    quote: "Ahora hago diseños para restaurantes locales. Empecé sin saber nada de diseño y hoy tengo 5 clientes fijos que me pagan cada mes.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=70",
    rating: 5,
  },
  {
    name: "José Eduardo Bonilla",
    age: 22,
    city: "Choluteca",
    course: "Introducción a Python",
    quote: "Pasé de no saber programar a conseguir una pasantía como desarrollador junior. El proyecto de la API con Flask fue lo que más me ayudó en la entrevista.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=70",
    rating: 5,
  },
];

function StoriesTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Historias reales de estudiantes que transformaron su vida con El Saber HN.
        </p>
      </div>
      {STORIES.map((s, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <img
                src={s.image}
                alt={s.name}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.age} años · {s.city}</p>
                <div className="mt-1 flex items-center gap-0.5">
                  {Array.from({ length: s.rating }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-slate-800 text-slate-800" />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm italic text-foreground">"{s.quote}"</p>
            <div className="mt-3 rounded-lg bg-primary/5 px-3 py-1.5">
              <p className="text-xs font-medium text-primary">Curso: {s.course}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
