# 🚢 Kubernetes

## **Slides**

[Kubernetes](https://docs.google.com/presentation/d/16zRNYTl_mf1umK_Rr6fNGKIs3Uo1B-sijrdBz_uYJpc/edit?usp=drivesdk)

### **Como correr Kubernetes localmente con Docker Desktop (Mac y Windows):**

[https://birthday.play-with-docker.com/kubernetes-docker-desktop/](https://birthday.play-with-docker.com/kubernetes-docker-desktop/)

### **Para Linux → minikube**

[https://kubernetes.io/es/docs/tasks/tools/install-minikube/](https://kubernetes.io/es/docs/tasks/tools/install-minikube/)

### **Necesitamos instalar kubectl, el cliente de kubernetes, para poder correr comandos sobre el cluster**

[https://kubernetes.io/es/docs/tasks/tools/install-kubectl/](https://kubernetes.io/es/docs/tasks/tools/install-kubectl/)

## **Algunas liberias y herramientas interesantes para usar**

[https://github.com/kubernetes/kompose](https://github.com/kubernetes/kompose) → Para transformar docker-compose en definiciones de kubernetes

[https://github.com/ahmetb/kubectx](https://github.com/ahmetb/kubectx) → Para cambiar facilmente el cluster o entorno al que apuntamos con kubectl

## **Ejemplo en clase**

**Repositorio**: [https://github.com/santiestra/kubernetes-example](https://github.com/santiestra/kubernetes-example)

Tenemos dos servicios: HelloService y ApiGateway

HelloService expone un endpoint `/` y ApiGatweay redirige la ruta `/hello` a ese endpoint.

**Pasos:**

1. Probemos lo que tenemos hecho con docker-compose, si corremos `docker-compose up` tenemos Api Gateway que es accesible desde el puerto 4444, mientras que Hello Service no es accesible desde fuera de la red privada de docker-compose.
2. Ahora queremos replicar eso en kubernetes
3. En este caso vamos a subir nuestras imagenes a DockerHub, pero podria ser cualquier otro repositorio de imagenes, como AWS ECR.  Hacemos `docker login` con nuestro user y pass.
4. Entramos a la carpeta `api-gateway` y corremos `docker build -t nombreUsuario/kube-api-gateway .` y luego `docker push nombreUsuario/kube-api-gateway`
5. Hacemos lo mismo con `hello-service`, `docker build -t nombreUsuario/kube-hello-service .` y luego `docker push nombreUsuario/kube-hello-service`
6. Creamos a modo de ejemplo el deployment de Api Gateway `kubectl create deployment api-gateway --port=3456 --image=nombreUsuario/kube-api-gateway:latest` . Podemos ver nuestros deployments corriendo `kubectl get deployments`
7. Podemos ver que levanto un `pod` corriendo `kubectl get pods`
8. Creamos un "service" para el deployment de Api Gateway, para exponerlo al mundo exterior, y con un Load Balancer.
`kubectl expose deployment api-gateway --type=LoadBalancer --port=3456`
Con el comando `kubectl get service api-gateway` vemos los detalles del servicio que acabamos de crear.
9. Por ahora si usamos el endpoint, falla, porque el servicio Hello no existe aun.
10. Veamos como escalar un servicio, `kubectl scale deployments/api-gateway --replicas=4`. Luego de esto, veamos el estado de nuestro cluster, con `kubectl get deployments` y `kubectl get pods`
11. Podemos ver como hacer un rolling update:
`kubectl set image deployments/api-gateway kube-api-gateway=nombreUsuario/kube-api-gateway` . Podemos agregarle otro tag, por ejemplo `:v2`, si se buildeo y pusheo con ese nuevo tag.
12. Hacer toda esta config con comandos es muy engorroso, lo comun es usar archivos de config.
13. Antes, eliminemos lo que hemos hecho hasta con `kubectl delete service api-gateway` y `kubectl delete deployment api-gateway`
14. Vamos a probar transformar nuestra config de docker-compose a kubernetes con la libreria [kompose](https://github.com/kubernetes/kompose). Luego de instalarla, creemos una carpeta llamada `kompose-files` y corramos `kompose convert -o kompose-files`. Veamos esos archivos en nuestro editor de codigo.
15. De esos archivos, cambiemos el nombre de las imagenes a las pusheadas a docker hub.
16. Tambien, cambiemos el service para que exponga una IP publica con LoadBalancer. Cambiamos las partes de `spec` y `status` de la siguiente manera:

    ```jsx
    spec:
      ports:
        - protocol: TCP
          port: 4444
          targetPort: 3456
      selector:
        io.kompose.service: api-gateway
      type: LoadBalancer
    status:
      loadBalancer:
        ingress:
          - ip: localhost
    ```

17. Apliquemos esos archivos con `kubectl apply -f kompose-files`
18. No nos genero un service para hello-service ya que no exponia ningun puerto en docker-compose.yml... creemoslo nosotros. Este no queremos que se exponga al exterior, pero si al cluster.

    ```jsx
    apiVersion: v1
    kind: Service
    metadata:
      name: hello-service
    spec:
      selector:
        io.kompose.service: hello-service
      ports:
        - protocol: TCP
          port: 3333
          targetPort: 3456
    ```

19. Tambien cambiemos la variable de entorno del api gateway deployment: [`http://hello-service:3333`](http://hello-service:3333/)
20. Apliquemos los cambios `kubectl apply -f kompose-files`
21. Ahora si hacemos `curl localhost:4444/hello`, funciona!
22. Probemos cambiar la cantidad de replicar, 3 de Api Gateway y 5 de Hello Service, y hagamos apply.
