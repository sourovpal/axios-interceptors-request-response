const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin authentication
  useEffect(() => {
    axios.get(`/api/checkAuthenticated`).then((res) => {
      if (res.status === 200) {
        setAdminAuthenticated(true);
      }
      setLoading(false);
    });

    return () => {
      setAdminAuthenticated(false);
    };
  }, []);


  axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
    if (err.response.status === 401) {
      swal("Unauthorized", err.response.data.message, "warning");
      history.push('/getin');
    }
    return Promise.reject(err);
  });

  axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    if (error.response.status === 403)// acces denied
    {
      swal('Forbidden', error.response.data.message, "warning");
      history.push('403')
    }
    else if (error.response.status === 404)// page not found
    {
      swal('404 Error', "Url/Page Not Found", "warning");
      history.push('404')
    }
    return Promise.reject(error);
  }
  );




  let routes = (
    <>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
    </>
  );

  if (adminAuthenticated) {
    routes = (
      <>
        <Route exact path="/">
          <Home />
        </Route>

        <Route path="/login">
          <Login />
        </Route>

        <Route path="/admin" component={Admin} />
        <Route path="/comprador" component={Comprador} />
        <Route path="/vendedor" component={Vendedor} />
        <Route path="/usuario" component={Usuario} />

      </>
    );
  }
