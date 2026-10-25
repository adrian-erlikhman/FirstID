import { Icon, Loop } from "../components";
import { examples } from "../examples";
import { t, type Lang } from "../i18n";

// OWNER: Adrian. The first thing anyone sees: the problem in one picture,
// then what the app does and how, before asking for anything.
export function HomeScreen({ lang, onStart, onExample }: { lang: Lang; onStart: () => void; onExample: (id: string) => void }) {
  const s = t[lang];
  return (
    <section className="screen home">
      <div className="hero">
        <h1 tabIndex={-1}>{s.homeTitle}</h1>
        <p className="lede">{s.homeLede}</p>
        <Loop lang={lang} />
        <p className="hero-way">{s.homeWayOut}</p>
        <div className="actions stack">
          <button className="primary" onClick={onStart}>{s.start} <Icon name="arrow" size={20} /></button>
          <button className="secondary" onClick={() => onExample("maria")}>{s.seeExample}: Maria</button>
        </div>
        <p className="for-who">{s.homeFor}</p>
      </div>

      <section className="block">
        <h2>{s.howTitle}</h2>
        <ol className="how">
          {s.how.map(([title, text], i) => (
            <li key={title}><span className="how-num" aria-hidden="true">{i + 1}</span><span><strong>{title}</strong><span className="muted">{text}</span></span></li>
          ))}
        </ol>
      </section>

      <section className="block">
        <h2>{s.featuresTitle}</h2>
        <ul className="features">
          {s.features.map(([icon, title, text]) => (
            <li key={title}><span className="feature-icon" aria-hidden="true"><Icon name={icon} size={20} /></span><strong>{title}</strong><span className="muted">{text}</span></li>
          ))}
        </ul>
      </section>

      <section className="block">
        <h2>{s.examplesTitle}</h2>
        <p className="muted small">{s.examplesNote}</p>
        <ul className="link-list">
          {examples.map((e) => (
            <li key={e.id}>
              <button className="link-row" onClick={() => onExample(e.id)}>
                <span><strong>{e.name}</strong><span className="muted">{e.line[lang]}</span></span>
                <Icon name="chevron" size={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="fine">{s.homeFine}</p>
    </section>
  );
}
