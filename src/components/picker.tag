<picker>
  <span>
    <h1>{ opts.value }</h1>
    <select onChange={ opts.onChange } value={ opts.value }>
      <option each={ val, i in opts.options } value={ val }>
        { val }
      </option>
    </select>
  </span>
</picker>
