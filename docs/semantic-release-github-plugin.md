# Конфигурация плагина @semantic-release/github

Плагин публикует [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github) и может комментировать закрытые issues/PR и создавать issue при падении релиза.

## Шаги плагина

| Шаг | Описание |
|-----|----------|
| `verifyConditions` | Проверяет токен (переменные окружения) и конфигурацию `assets`. |
| `publish` | Создаёт GitHub Release и при необходимости загружает файлы (assets). |
| `addChannel` | Обновляет поле pre-release у существующего релиза (для пре-релизов). |
| `success` | Пишет комментарий в каждый issue/PR, попавший в релиз; закрывает issue, созданные шагом `fail`. |
| `fail` | Создаёт или обновляет issue с описанием ошибок релиза. |

---

## Аутентификация (обязательно)

Токен задаётся **только через переменные окружения**:

| Переменная | Описание |
|------------|----------|
| `GITHUB_TOKEN` или `GH_TOKEN` | **Обязательно.** Токен для доступа к GitHub API. |

В GitHub Actions обычно передают встроенный токен:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Минимальные права для `GITHUB_TOKEN` в настройках workflow:
- `contents: write` — создание релиза
- `issues: write` — комментарии к issues
- `pull-requests: write` — комментарии к PR

**Важно:** релизы, созданные с `GITHUB_TOKEN`, не запускают другие workflow по событию release. Если нужны триггеры на новый релиз — используйте свой Personal Access Token в секретах репозитория (любое имя, кроме `GITHUB_TOKEN`).

---

## Опции конфигурации

В `.releaserc.json` (или другом конфиге semantic-release) плагин подключается так:

```json
[
  "@semantic-release/github",
  {
    "githubUrl": "https://github.com",
    "assets": [...],
    "successComment": "...",
    ...
  }
]
```

### URL и API

| Опция | Описание | По умолчанию |
|-------|----------|--------------|
| **`githubUrl`** | URL сервера GitHub (сайт). | `GH_URL` или `GITHUB_URL` из env. |
| **`githubApiPathPrefix`** | Префикс пути API относительно `githubUrl`. | `GH_PREFIX` / `GITHUB_PREFIX` из env. |
| **`githubApiUrl`** | Полный URL API (переопределяет префикс). | `GITHUB_API_URL` из env. |

Для обычного github.com обычно ничего не задают — хватает `GITHUB_TOKEN`.  
Для **GitHub Enterprise** или своего хоста указывают, например:

```json
{
  "githubUrl": "https://github.mycompany.com",
  "githubApiUrl": "https://github.mycompany.com/api/v3"
}
```

Переменные окружения с теми же смыслами: `GITHUB_URL`, `GITHUB_API_URL`, `GITHUB_PREFIX`.

**Важно:** в конфиге опция называется **`githubUrl`** (с маленькой «h»). Вариант `gitHubUrl` в документации плагина не указан и может не работать.

---

### Репозиторий

Репозиторий по умолчанию берётся из:
- поля `repository` в `package.json`, или
- git remote `origin`.

Явно в плагине URL репозитория не задаётся; для смены хоста/репо используются `githubUrl` / `githubApiUrl` и корректный `repository` в `package.json` или remote.

---

### assets — файлы к релизу

Файлы, которые будут прикреплены к GitHub Release.

**Формат:** массив. Элемент может быть:
- **строка (glob):** `"dist/*.js"`, `"dist/**/*.zip"`
- **объект:** `{ "path": "...", "label": "...", "name": "..." }`

| Свойство | Описание | По умолчанию |
|----------|----------|--------------|
| **`path`** | Glob или путь к файлу/папке. | — |
| **`name`** | Имя файла на GitHub (Lodash template). | Имя из `path`. |
| **`label`** | Подпись к файлу на странице релиза. | — |

В шаблонах доступны: `branch`, `lastRelease`, `nextRelease`, `commits`.

**Примеры:**

```json
"assets": [
  "dist/*.js",
  { "path": "dist/bundle.js", "label": "JS bundle" },
  { "path": "dist/app.zip", "name": "app-${nextRelease.gitTag}.zip", "label": "Archive" }
]
```

Исключения через glob: `["dist/**", "!**/*.map"]`.

---

### successComment — комментарий при успешном релизе

Текст комментария, который плагин оставляет в issue/PR, попавших в релиз.

- **Шаблон:** [Lodash template](https://lodash.com/docs#template).
- **Переменные:** `branch`, `lastRelease`, `nextRelease`, `commits`, `releases`, `issue`.
- **Отключить комментарии:** `"successComment": false`.

**По умолчанию:**  
`:tada: This issue has been resolved in version ${nextRelease.version} :tada:\n\nThe release is available on [GitHub release](...)`

**Пример кастомного:**

```json
"successComment": "Версия ${nextRelease.version} вышла. PR/issue вошёл в этот релиз."
```

---

### successCommentCondition — когда писать success-комментарий

Условие (Lodash template), при котором комментарий вообще пишется.  
Доступны те же переменные, что и в `successComment`, плюс `issue`.

**Примеры:**

```json
"successCommentCondition": "<% return issue.pull_request; %>"
```
Только в pull request’ы.

```json
"successCommentCondition": "<% return !issue.pull_request; %>"
```
Только в issues.

```json
"successCommentCondition": "<% return false; %>"
```
Никогда не комментировать (по смыслу то же, что отключить через `successComment`).

---

### failTitle и failComment — issue при падении релиза

Когда релиз падает, плагин может создать issue.

| Опция | Описание | По умолчанию |
|-------|----------|--------------|
| **`failTitle`** | Заголовок issue. | `The automated release is failing 🚨` |
| **`failComment`** | Текст issue (Lodash template). | Сообщение с ошибками и ссылками на документацию. |

Переменные для `failComment`: `branch`, `errors` (массив ошибок с `message`, `code`, `pluginName`, `details`).

**Отключить создание issue:**  
`"failTitle": false` или `"failComment": false`.

---

### failCommentCondition

Условие (Lodash template), при котором создаётся/обновляется issue при ошибке.  
Переменные: `branch`, `errors`.

---

### labels и assignees

| Опция | Описание | По умолчанию |
|-------|----------|--------------|
| **`labels`** | Метки у issue при падении релиза. | `['semantic-release']` |
| **`assignees`** | Логины назначенных (массив строк). | — |

**Не вешать метки:** `"labels": false`.

---

### releasedLabels — метки на закрытых issue/PR

Метки, которые добавляются к issue и PR, попавшим в релиз.

**По умолчанию:**  
`['released on @${nextRelease.channel}']` или `['released']` для канала по умолчанию.

**Отключить:** `"releasedLabels": false`.

**Пример:**

```json
"releasedLabels": ["released in ${nextRelease.version}"]
```

Шаблон поддерживает Lodash и переменные вроде `nextRelease`.

---

### addReleases

Куда в описание GitHub Release подставлять ссылки на опубликованные артефакты (например, npm): `"top"`, `"bottom"` или `false` (не добавлять).

**По умолчанию:** `false`.

---

### draftRelease

Создавать релиз как черновик (Draft), не публиковать сразу.

**По умолчанию:** `false`.

---

### releaseNameTemplate и releaseBodyTemplate

Шаблоны (Lodash) для заголовка и тела GitHub Release.

**По умолчанию:**  
- имя: по шаблону из документации (часто версия/тег);
- тело: `nextRelease.notes` (то, что сгенерировал release-notes-generator).

Можно переопределить, например, добавить префикс к заголовку или обернуть notes в свою разметку.

---

### discussionCategoryName

Имя категории Discussions, к которой привязать обсуждение релиза.  
**По умолчанию:** `false` (обсуждение не создаётся).

---

### proxy

Настройка HTTP-прокси для запросов к GitHub API.

- **Строка:** URL прокси, например `"http://proxy:3128"`.
- **Объект:** `{ "host": "...", "port": 3128, "secureProxy": false, "headers": {} }`.
- **Отключить прокси из env:** `"proxy": false`.

По умолчанию используется переменная окружения `HTTP_PROXY`, если она задана.

---

## Минимальный пример

Только публикация релиза на github.com, без комментариев и доп. опций:

```json
[
  "@semantic-release/github",
  {}
]
```

С указанием своего GitHub (Enterprise):

```json
[
  "@semantic-release/github",
  {
    "githubUrl": "https://github.mycompany.com",
    "githubApiUrl": "https://github.mycompany.com/api/v3"
  }
]
```

С прикреплением артефактов и кастомным комментарием:

```json
[
  "@semantic-release/github",
  {
    "assets": [
      { "path": "dist/*.js", "label": "JS build" },
      { "path": "dist/*.css", "label": "CSS build" }
    ],
    "successComment": "Вышла версия ${nextRelease.version}. Этот PR в неё вошёл.",
    "releasedLabels": ["released in ${nextRelease.version}"]
  }
]
```

---

## Про ваш конфиг

Сейчас у вас указано:

```json
"gitHubUrl": "https://github.com/AsukaTundra/test-semantic-release.git"
```

В официальной документации плагина опция называется **`githubUrl`** (с маленькой «h»), и значение — это **URL сервера GitHub**, а не репозитория. Для обычного GitHub это просто `https://github.com`. URL репозитория плагин определяет сам из `package.json` или git remote.

Рекомендуется:
- Заменить `gitHubUrl` на **`githubUrl`**.
- В качестве значения использовать **`https://github.com`** (или ваш GitHub Enterprise URL), а не полный URL репозитория.

Если репозиторий уже правильно указан в `package.json` (`repository`) или в `origin`, то для github.com можно вообще не задавать URL:

```json
[
  "@semantic-release/github",
  {}
]
```

Если хотите, могу подсказать точный фрагмент правки для вашего `.releaserc.json`.
