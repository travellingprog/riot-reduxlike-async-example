<picker>
  <span>
    <h1>{ opts.selection }</h1>
    <select onchange={ onChange } value={ opts.selection }>
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
