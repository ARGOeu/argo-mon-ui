# Status Pages UI

This project is a React and TypeScript application built with Vite. It relies on two backend services:

- argo-web-api
- api-status-mon-api

## Local Environment Setup

Before running the project locally, ensure you have a working Docker environment set up.

### Step 1: Run argo-web-api locally

To begin issue:

```
git clone https://github.com/argoeu/argo-web-api -b devel
cd argo-web-api/docker
docker-compose up --build
```

### Step 2: Run argo-status-mon-api locally

Dependencies:

- Java 17
- Apache Maven 3.9.15

To begin issue:

```
git clone https://github.com/argoeu/argo-mon-status-api
cd argo-mon-status-api
```

Add your GitHub credentials to your Maven settings.xml so that Maven can pull the quarkus-auth dependency from the GitHub Packages repository:

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0">
  <servers>
    <server>
      <id>github</id>
      <username>your-github-username-here</username>
      <password>your-github-access-key-here</password>
    </server>
  </servers>
</settings>
```

Then issue:

```
mvn clean && mvn quarkus:dev
```

### Step 3: Run the status-ui React app

Depedencies:

- Node 20.x

To begin issue:

```
git clone https://github.com/argoeu/status-ui -b devel
cd status-ui
Copy .env.example to .env and use it as is, or modify it to suit your needs.
npm install
npm run dev
```
