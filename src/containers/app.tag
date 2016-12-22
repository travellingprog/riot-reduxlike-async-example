<app>
  <picker
    value={ selectedReddit }
    onChange={ handleChange }
    options={ ['reactjs', 'frontend'] }
  />
  <p>
    <span if={ lastUpdated }>
      Last updated at { new Date(lastUpdated).toLocaleTimeString() }.
      {' '}
    </span>
    <a if={ !isFetching } href="#" onClick={ handleRefreshClick }>
      Refresh
    </a>
  </p>
  <virtual if={ isEmpty }>
    <h2 if={ isFetching  }>Loading...</h2>
    <h2 if={ !isFetching }>Empty</h2>
  </virtual>
  <div if={ !isEmpty } style="opacity: { isFetching ? 0.5 : 1 }">
    <posts data={ posts } />
  </div>

  <script>
    this.selectedReddit = 'frontend';

    this.lastUpdated = Date.now();

    this.isFetching = true;

    this.isEmpty = false;

    this.posts = [
      { title: 'How to shake the milk in milkshake' },
      { title: 'Good morning, south dakota' },
      { title: 'How I grew to love the semi-automatic riffle' },
    ];

    handleChange() {
      console.log('changed picker');
    }

    handleRefreshClick() {
      console.log('clicked refresh');
    }
  </script>
</app>
