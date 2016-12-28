<picker>
  <span>
    <h1>{ opts.value }</h1>
    <select onChange={ onChange } value={ opts.value }>
      <option each={ val, i in opts.options } value={ val }>
        { val }
      </option>
    </select>
  </span>

  <script>
    onChange(e) {
      opts.onpickerchange(e.target.value);
    }
  </script>
</picker>
