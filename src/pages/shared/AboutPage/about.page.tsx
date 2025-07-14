import React, { useState } from 'react';
import { Card, Tag, Typography, Timeline, Divider } from 'antd';
import {
  TeamOutlined,
  BulbOutlined,
  ExperimentOutlined,
  SettingOutlined,
  UserOutlined,
  CodeOutlined,
  RocketOutlined,
  DatabaseOutlined,
  ToolOutlined,
  HeartOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ExpandOutlined,
  CompressOutlined
} from '@ant-design/icons';
import './about.page.scss';

const { Title, Paragraph, Text } = Typography;

type DescriptionItem =
  | { type: 'paragraph'; content: string; strong?: string }
  | { type: 'list'; strong: string; items: { content: string; strong?: string }[] };

interface ModuleItem {
  icon: React.ReactNode;
  title: string;
  status: string;
  description: DescriptionItem[];
  isImplemented: boolean;
}

export function AboutPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleModule = (moduleKey: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  // Функция для извлечения превью текста из описания
  const getModulePreview = (description: DescriptionItem[]): string => {
    let preview = '';
    for (const item of description) {
      if (item.type === 'paragraph') {
        preview += item.content + ' ';
        if (preview.length > 300) break;
      }
    }
    return preview.length > 300 ? preview.substring(0, 300) + '...' : preview;
  };

  const principles = [
    {
      icon: <UserOutlined />,
      title: "Равный вклад каждого участника",
      description: "Каждый пользователь имеет один голос, который не подлежит делегированию или искажению через рейтинговые системы. Экспертные мнения носят рекомендательный характер.",
      detail: "Обеспечивает подключение и использование интеллектуального потенциала всего сообщества — без искажений, фильтров и иерархий. Независимо от уровня активности, опыта или социального статуса, каждый голос имеет одинаковый вес. Это создаёт прочную основу для формирования коллективного разума."
    },
    {
      icon: <RocketOutlined />,
      title: "Непрерывное и динамичное голосование",
      description: "Голосование всегда остаётся открытым, за исключением временных событий с ограниченными последствиями. Пользователь может в любой момент изменить свою позицию.",
      detail: "Мнения участников со временем меняются — под влиянием новых знаний, обсуждений и жизненного опыта. Кроме того, изменяется и состав самого сообщества: люди приходят, уходят, становятся более или менее активными. Непрерывное голосование отражает эту динамику и делает решения актуальными для текущего состояния группы, а не зафиксированными в прошлом. Это обеспечивает адаптивность, снижает ошибочность и укрепляет чувство причастности."
    },
    {
      icon: <TeamOutlined />,
      title: "Принцип затрагивающих последствий",
      description: "Участие в принятии решений доступно только тем, кого непосредственно затрагивают последствия выбора. Зоны ответственности каждого сообщества определяются коллективно и могут быть пересмотрены.",
      detail: "Решения должны приниматься теми, кто будет жить с их последствиями. Такой подход повышает чувство ответственности и вовлечённость, укрепляя доверие к результатам. Это также создаёт более точную обратную связь между выбором и его эффектом, что усиливает обучающую функцию системы."
    },
    {
      icon: <SettingOutlined />,
      title: "Гибкие настройки сообществ",
      description: "Участники сами определяют кворум, пороги для принятия решений, зоны ответственности и другие параметры.",
      detail: "Каждое сообщество уникально. Гибкость в настройках позволяет адаптировать механизмы принятия решений под размер, цели и характер группы — от временных команд до устойчивых организаций. Это даёт реальную возможность влиять на архитектуру процессов без выхода за рамки общей структуры платформы."
    },
    {
      icon: <HeartOutlined />,
      title: "Система доверенных советников",
      description: "Участники могут выбирать советников по различным темам, при этом окончательное решение всегда остаётся за ними.",
      detail: "Позволяет учитывать мнение людей, которым участник доверяет, без передачи им контроля над своим голосом. Это снижает когнитивную нагрузку и упрощает участие в сложных темах, сохраняя при этом возможность влиять на каждое решение напрямую. Такая модель поддерживает устойчивость системы даже при неравномерной активности, не нарушая принцип личной ответственности за выбор."
    },
    {
      icon: <StarOutlined />,
      title: "Гибкая структура",
      description: "Возможность создания и настройки внутренних сообществ (подгрупп) позволяет участникам самостоятельно формировать структуру.",
      detail: "Модульная структура повышает управляемость и масштабируемость коллективного разума. Подгруппы могут сосредоточиться на специфических задачах, при этом оставаться частью единой экосистемы. Это позволяет сочетать глубину фокуса с широтой кооперации."
    }
  ];

  const modules: ModuleItem[] = [
    {
      icon: <CheckCircleOutlined />,
      title: "Правила и инициативы сообществ",
      status: "реализован базовый функционал",
      isImplemented: true,
      description: [
        {
          type: "paragraph",
          strong: "Подача предложений",
          content: "Участник может внести предложение: новое правило или инициативу с описанием целей, задач и ожидаемого результата."
        },
        {
          type: "paragraph",
          strong: "Процесс голосования",
          content: "Постоянное (перманентное) голосование. Участники могут добавлять альтернативные варианты. Вступление в силу происходит после достижения кворума и анализа «коллективного портрета мнений»."
        },
        {
          type: "paragraph",
          strong: "Последствия",
          content: "Механизм коллективного выбора последствий нарушений. Утверждённые меры применяются в системе разрешения конфликтов."
        },
        {
          type: "list",
          strong: "ИИ-поддержка",
          items: [
            {
              strong: "Формулирование: ",
              content: "LLM помогает уточнить идею, спрогнозировать последствия, сформировать корректный текст.",
            },
            {
              strong: "Коммуникация: ",
              content: "агрегирует мнения, визуализирует взгляды сообщества, поддерживает диалог в формате «как если бы ты общался со всеми участниками сразу»",
            },
            {
              strong: "Валидация: ",
              content: "проверяет соответствие зонам ответственности, выявляет дублирования и блокирует конфликтные предложения.",
            },
            {
              strong: "Поддержка компромиссов ",
              content: "и передача в «Лабораторию», если компромисс не достигнут.",
            }
          ]
        },
        {
          type: "list",
          strong: "Этап реализации инициатив",
          items: [
            {
              strong: "Формирование рабочей группы: ",
              content: "голосование за состав, выбор координатора, который выполняет технические функции без полномочий принятия решений.",
            },
            {
              strong: "Разработка и утверждение плана: ",
              content: "публичное обсуждение, голосование, выбор стратегии реализации (внутренней, внешней или гибридной).",
            },
            {
              strong: "Многоэтапная приёмка: ",
              content: " включает публичное тестирование, итоговое голосование и последующий анализ соответствия первоначальному замыслу.",
            }
          ]
        }
      ]
    },
    {
      icon: <ToolOutlined />,
      title: "Модуль разрешения конфликтов",
      status: "на стадии проектирования",
      isImplemented: false,
      description: [
        {
          type: "paragraph",
          strong: "Инициирование",
          content: "Споры можно инициировать по поводу нарушения правил, ущерба при реализации инициатив или по поводу участия в сообществе."
        },
        {
          type: "paragraph",
          strong: "Процедура",
          content: "ИИ анализирует доводы сторон, формирует интерактивную карту конфликта. Решение принимается через общее голосование. Платформа отслеживает выполнение условий."
        }
      ]
    },
    {
      icon: <ExperimentOutlined />,
      title: "Лаборатория",
      status: "на стадии проектирования",
      isImplemented: false,
      description: [
        {
          type: "paragraph",
          strong: "Открытые вызовы",
          content: "Любой участник может опубликовать задачу, которая требует нестандартного подхода: от локальных проблем до глобальных тем. Допускаются идеи в любом формате."
        },
        {
          type: "paragraph",
          strong: "Анализ вкладов",
          content: "LLM выделяет ценные фрагменты: факты, гипотезы, аналогии, наблюдения, необычные связи. Объединяет их в кластеры и отмечает уникальные перспективы."
        },
        {
          type: "paragraph",
          strong: "Открытые вызовы",
          content: "Любой участник может опубликовать задачу, которая требует нестандартного подхода: от локальных проблем до глобальных тем. Допускаются идеи в любом формате."
        },
        {
          type: "paragraph",
          strong: "Синтез решений",
          content: "Роль и результат: цель модуля — выявлять инсайты, которые неочевидны в рамках индивидуального подхода. Система соединяет знания и помогает участникам увидеть потенциал коллективной мысли."
        }
      ]
    },
    {
      icon: <DatabaseOutlined />,
      title: "Реестр коллективного опыта",
      status: "на стадии проектирования",
      isImplemented: false,
      description: [
        {
          type: "paragraph",
          strong: "Цель",
          content: "Анализировать и сохранять знания, полученные в процессе использования платформы: правила, инициативы, разрешённые конфликты, результаты работы Лаборатории."
        },
        {
          type: "list",
          strong: "ИИ-поддержка",
          items: [
            {
              content: "LLM извлекает паттерны, этапы принятия решений и последствия.",
            },
            {
              content: "Формирует взаимосвязанную «карту знаний» из множества кейсов.",
            },
            {
              content: "Выдаёт контекстные рекомендации для новых ситуаций, предотвращает повтор ошибок, ускоряет процесс обсуждения и голосования.",
            },
          ]
        },
        {
          type: "paragraph",
          strong: "Ценность",
          content: "Это инструмент коллективной памяти, который со временем позволяет сообществам принимать более точные, взвешенные и устойчивые решения."
        }
      ]
    },
    {
      icon: <TeamOutlined />,
      title: "Интеграции с сообществами",
      status: "на стадии проектирования",
      isImplemented: false,
      description: [
        {
          type: "paragraph",
          strong: "Объединение усилий",
          content: "Сообщества могут выстраивать постоянные каналы для реализации совместных проектов. При большом числе совместных инициатив может быть сформировано общее, более высокоуровневое сообщество."
        },
        {
          type: "list",
          strong: "Механика проектов",
          items: [
            {
              content: "Любое сообщество в канале может предложить проект.",
            },
            {
              content: "Одобрение проекта возможно только при единогласии всех участвующих сообществ.",
            },
            {
              content: "Рабочие группы формируются на равных условиях: каждое сообщество делегирует равное число участников, если превышено — отбор происходит случайно.",
            },
            {
              content: "Координатор общей группы назначается случайным образом из состава.",
            },
          ]
        },
        {
          type: "paragraph",
          strong: "Принятие решений",
          content: "Каждый участник использует собственные внутренние правила голосования. Решения действуют, только если поддержаны всеми сообществами."
        }
      ]
    }
  ];

  const techStack = [
    { name: "React", description: "TypeScript + Ant Design" },
    { name: "FastAPI", description: "Python Backend" },
    { name: "Vector DB", description: "Хранение эмбеддингов" },
    { name: "Redis", description: "Кэш и сессии" },
    { name: "Mixtral", description: "Локальный LLM" },
    { name: "GitHub Actions", description: "CI/CD" }
  ];

  const targetAudience = [
    "Разработка опенсорсного ПО",
    "Малый бизнес",
    "ЖКХ и ТСЖ",
    "Учебные заведения",
    "Некоммерческие организации"
  ];

  const roles = [
    { icon: <CodeOutlined />, title: "Разработчики", subtitle: "Frontend/Backend" },
    { icon: <BulbOutlined />, title: "Специалисты по ИИ", subtitle: "ML и коллективное сознание" },
    { icon: <TeamOutlined />, title: "Эксперты по коммуникациям", subtitle: "UX/UI, психологи" },
    { icon: <ExperimentOutlined />, title: "Исследователи", subtitle: "Коллективное принятие решений" }
  ];

  const ModuleDescription = ({ description, }: {
    description: DescriptionItem[];
  }) => (
    <div className="module-description">
      {description.map((item, index) => {
        if (item.type === 'paragraph') {
          return (
            <Paragraph
              key={`paragraph-${index}`}
              className="description-paragraph"
            >
              {item.strong && <strong>{item.strong}</strong>}
              {item.content}
            </Paragraph>
          );
        }
        if (item.type === 'list') {
          return (
            <div key={`list-container-${index}`}>
              {item.strong && (
                <Paragraph key={`list-header-${index}`} className="description-paragraph">
                  <strong>{item.strong}</strong>
                </Paragraph>
              )}
              <ul key={`list-${index}`} className="description-list">
                {item.items.map((listItem, i) => (
                  <li key={`list-item-${index}-${i}`} className="description-list-item">
                    {listItem.strong && <strong>{listItem.strong}</strong>}
                    {listItem.content}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );

  const timelineItems = modules.map((module, index) => ({
    key: `module-${index}`,
    dot: (
      <div
        className={`timeline-dot ${module.isImplemented ? 'implemented' : 'planned'}`}
      >
        {module.icon}
      </div>
    ),
    color: module.isImplemented ? 'green' : 'blue',
    children: (
      <Card
        className={`module-card-enhanced ${expandedModules[`module-${index}`] ? 'expanded' : ''}`}
        onClick={() => toggleModule(`module-${index}`)}
      >
        <div className="module-header-enhanced">
          <div className="module-title-section">
            <Title level={4} className="module-title-enhanced">{module.title}</Title>
            <Tag
              color={module.isImplemented ? 'green' : 'blue'}
              className="module-status-tag"
            >
              {module.status}
            </Tag>
          </div>
        </div>

        {!expandedModules[`module-${index}`] ? (
          // Превью состояние
          <div className="module-preview">
            <div className="preview-text">
              {getModulePreview(module.description)}
            </div>
            <div className="expand-button-container">
              <div
                className="expand-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModule(`module-${index}`);
                }}
              >
                <ExpandOutlined className="expand-icon" />
                <span>Развернуть</span>
              </div>
            </div>
          </div>
        ) : (
          // Полное содержимое
          <div className="module-full-content">
            <ModuleDescription description={module.description} />
            <div className="collapse-button-container">
              <div
                className="collapse-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModule(`module-${index}`);
                }}
              >
                <CompressOutlined className="collapse-icon" />
                <span>Свернуть</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    ),
  }));

  return (
    <div className="about-page">
      <div className="content-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <Title level={1} className="hero-title">
              Платформа для раскрытия потенциала коллективного интеллекта
            </Title>
            <Paragraph className="hero-description">
              Экспериментальная технологическая система, которая помогает
              группам людей, от локальных сообществ до организаций, эффективно
              сотрудничать, принимать решения и реализовывать проекты через
              коллективный разум. Проект развивается как открытая
              исследовательская платформа.
            </Paragraph>
          </div>
          <div className="hero-visual">
            <div className="network-visualization">
              <div className="node central-node">
                <BulbOutlined />
              </div>
              <div className="node node-1"><UserOutlined /></div>
              <div className="node node-2"><TeamOutlined /></div>
              <div className="node node-3"><ExperimentOutlined /></div>
              <div className="node node-4"><SettingOutlined /></div>
              <div className="connection con-1"></div>
              <div className="connection con-2"></div>
              <div className="connection con-3"></div>
              <div className="connection con-4"></div>
            </div>
          </div>
        </div>

        {/* Research Section */}
        <section className="content-section">
          <Title level={2} className="section-title">
            <BulbOutlined className="section-icon" />
            Исследование коллективного интеллекта
          </Title>
          <Card className="research-card">
            <Paragraph className="research-description">
              Современный объём знаний давно превзошёл когнитивные способности отдельного человека. За последние годы развитие LLM открыло возможность перейти от индивидуального и группового мышления к принципиально новому уровню — коллективному разуму.
            </Paragraph>
            <Paragraph className="research-description">
              Мы выдвигаем гипотезу, что ИИ-посредник может обеспечить качественно новый уровень коллективного интеллекта — способности находить решения, превосходящие по качеству, оригинальности и проработанности результаты отдельных индивидов или традиционных обособленных групп при одновременном выполнении следующих ключевых условий:
            </Paragraph>

            {/* Quick Overview */}
            <div className="quick-overview">
              <div className="overview-cards">
                <Card className="overview-card">
                  <div className="card-icon"><UserOutlined /></div>
                  <Title level={5}>Массовое вовлечение</Title>
                  <Text>Участие достаточного количества людей, чьи когнитивные способности и знания обычно не задействованы в традиционных системах принятия решений.</Text>
                </Card>
                <Card className="overview-card">
                  <div className="card-icon"><HeartOutlined /></div>
                  <Title level={5}>Высокая мотивация</Title>
                  <Text>Когда большинство участников самостоятельно проявляют инициативу и заинтересованность в процессе коллективного творчества.</Text>
                </Card>
                <Card className="overview-card">
                  <div className="card-icon"><StarOutlined /></div>
                  <Title level={5}>Сбалансированное разнообразие</Title>
                  <Text>Сочетание экспертного знания с разнообразием мнений и жизненного опыта участников.</Text>
                </Card>
                <Card className="overview-card">
                  <div className="card-icon"><RocketOutlined /></div>
                  <Title level={5}>Алгоритмическая координация</Title>
                  <Text>Наличие механизмов для эффективной коллективной коммуникации, поддержка структурированного обмена идеями и синтеза прототипов решений.</Text>
                </Card>
              </div>
            </div>

            <div className="expected-results">
              <Title level={4}>При выполнении этих условий предполагается, что система сможет демонстрировать:</Title>
              <ul>
                <li>Качественное превосходство решений над индивидуальными и узкогрупповыми результатами.</li>
                <li>Устойчивые консенсусные выводы, учитывающие множество точек зрения.</li>
                <li>Повышенную креативную продуктивность коллектива.</li>
                <li>Накопление коллективного опыта через создание постоянно расширяющейся общей базы знаний и решений.</li>
              </ul>
            </div>
          </Card>
        </section>

        {/* Principles Section */}
        <section className="content-section">
          <Title level={2} className="section-title">
            <SettingOutlined className="section-icon" />
            Ключевые принципы системы
          </Title>
          <Paragraph className="section-description">
            Эти принципы — основа устойчивой, справедливой и развивающейся системы коллективного принятия решений. Они обеспечивают включённость, гибкость и управляемость, создавая среду, в которой интеллект множества работает как единое целое.
          </Paragraph>

          <div className="principles-grid">
            {principles.map((principle, index) => (
              <Card
                key={index}
                className={`principle-card ${expandedSections.includes(`principle-${index}`) ? 'expanded' : ''}`}
                onClick={() => toggleSection(`principle-${index}`)}
              >
                <div className="principle-header">
                  <div className="principle-icon">{principle.icon}</div>
                  <div className="principle-content">
                    <Title level={4}>{principle.title}</Title>
                    <Paragraph>{principle.description}</Paragraph>
                  </div>
                </div>
                {expandedSections.includes(`principle-${index}`) && (
                  <div className="principle-detail">
                    <Divider />
                    <Paragraph><strong>Почему это важно:</strong></Paragraph>
                    <Paragraph>{principle.detail}</Paragraph>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Modules Section */}
        <section className="content-section">
          <Title level={2} className="section-title">
            <ToolOutlined className="section-icon" />
            Ключевые модули системы
          </Title>
          <Paragraph className="section-description">
            Каждый модуль платформы — это инструмент для развития культуры совместного мышления. Здесь создаются условия, в которых участники способны вырабатывать обоснованные, сбалансированные и практически применимые решения на основе разнообразия точек зрения и накопленного опыта.
          </Paragraph>

          <div className="modules-timeline">
            <Timeline items={timelineItems} />
            <div className="modules-note">
              Некоторые модули уже доступны для использования, другие находятся в
              разработке. Мы постоянно улучшаем платформу и добавляем новые
              возможности.
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="content-section">
          <Title level={2} className="section-title">
            <CodeOutlined className="section-icon" />
            Технологии
          </Title>
          <div className="tech-stack">
            {techStack.map((tech, index) => (
              <Card key={index} className="tech-card">
                <Title level={4}>{tech.name}</Title>
                <Text>{tech.description}</Text>
              </Card>
            ))}
          </div>
        </section>

        {/* Target Audience */}
        <section className="content-section">
          <Title level={2} className="section-title">
            <TeamOutlined className="section-icon" />
            Для кого это полезно
          </Title>
          <div className="audience-tags">
            {targetAudience.map((audience, index) => (
              <Tag key={index} className="audience-tag">{audience}</Tag>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="content-section team-section">
          <Title level={2} className="section-title">
            <UserOutlined className="section-icon" />
            Кого мы ищем
          </Title>
          <div className="roles-grid">
            {roles.map((role, index) => (
              <Card key={index} className="role-card">
                <div className="role-icon">{role.icon}</div>
                <Title level={4}>{role.title}</Title>
                <Text>{role.subtitle}</Text>
              </Card>
            ))}
          </div>

          <Card className="join-card">
            <Title level={3}>Присоединяйтесь, если</Title>
            <ul>
              <li>Вам близки технологии, которые объединяют людей.</li>
              <li>Вы верите, что даже в противоположных позициях можно найти точки роста.</li>
              <li>Вы готовы к долгому пути, где важен каждый шаг.</li>
            </ul>
            <Paragraph className="closing-note">
              <strong>P.S.</strong> Иногда самый важный код — не строки в редакторе, а диалог между теми, кто хочет изменить подход к совместной работе.
            </Paragraph>
          </Card>
        </section>
      </div>
    </div>
  );
}