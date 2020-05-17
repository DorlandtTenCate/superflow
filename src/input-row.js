import React from 'react'

export default function InputRow(name, value, setter) {
  return(
    <div class="col">
      <div class="form-group">
        <label for="width">{description}</label>
        <input id="width" class="form-control" type="number" value="{value}" onChange={setter} />
      </div>
    </div>
  )
}