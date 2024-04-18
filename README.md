## BITCOIN TRACKER ##

# Running locally
1. Install modules with `npm install`

2. Set up `.env` file with `CRYPTO_API_KEY=yourapikey` from `https://www.coingecko.com/en/api` and `AUTH_KEY=yourpassword`

3. Compile and run local server with `npm run build` and `npm start`

4. Test the endpoint at `http://localhost:3000/price`

# Building Docker image

1. In root folder, run `docker build -t <imagename>:<version> . `

2. Run locally with `docker run -p 3000:3000 -d <imagename>`

3. Push to repository `docker tag <imagename> <username>/<repository>:<tag>` and `docker push <username>/<repository>:<tag>` once logged in.

# Creating Kubernetes cluster
For this project I used Minikube, you can learn more here: `https://kubernetes.io/docs/tutorials/kubernetes-basics/create-cluster/cluster-intro/`

# Starting HELM

1. Run `helm install bitcoin-tracker-release bitcoin-tracker-chart`

2. Once Helm and pod is ready you can use `Minikube tunnel` to access the endpoint

