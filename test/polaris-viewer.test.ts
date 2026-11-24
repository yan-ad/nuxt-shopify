import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PROP_VALUE,
  selectPropValue,
  getControls,
  initialProps,
  previewMarkup,
  vueSnippet
} from '../docs/app/utils/polaris-viewer'

describe('Vue property viewer', () => {
  it('edits simple default-slot text without injecting markup or Vue expressions', () => {
    const initial = initialProps('button')
    expect(initial.slotText).toBe('Click me')
    expect(getControls('button')[0]).toEqual({ name: 'slotText', kind: 'text' })
    const values = { ...initial, slotText: '<img src=x>{{ secret }}' }
    const snippet = vueSnippet('button', values)
    expect(snippet).toContain('&lt;img src=x&gt;&#123;&#123; secret }}')
    expect(snippet).not.toContain('<img src=x>')
    expect(snippet).not.toContain('slot-text=')
    expect(previewMarkup('button', { ...initial, slotText: '' })).toContain(
      '></s-button>'
    )
  })

  it('preserves structured slots instead of flattening their children', () => {
    expect(
      getControls('box').some((control) => control.name === 'slotText')
    ).toBe(false)
    expect(previewMarkup('box', initialProps('box'))).toContain('<s-text>')
  })
  it('uses a non-empty select sentinel and clears only the generated prop', () => {
    expect(DEFAULT_PROP_VALUE).not.toBe('')
    expect(selectPropValue(DEFAULT_PROP_VALUE)).toBe('')
    expect(selectPropValue('success')).toBe('success')
    expect(selectPropValue(undefined)).toBe('')
    const snippet = vueSnippet('progress', {
      ...initialProps('progress'),
      tone: selectPropValue(DEFAULT_PROP_VALUE)
    })
    expect(snippet).not.toContain(DEFAULT_PROP_VALUE)
    expect(snippet).not.toContain('tone=')
  })
  it('derives text field controls from Vue props', () => {
    expect(getControls('text-field')).toContainEqual({
      name: 'disabled',
      kind: 'boolean'
    })
    expect(
      getControls('text-field').some((prop) => prop.name === 'modelValue')
    ).toBe(true)
    expect(getControls('toString')).toEqual([])
  })
  it('keeps values in the Vue model and native preview in sync', () => {
    const values = {
      ...initialProps('text-field'),
      label: 'Product name',
      modelValue: 'Everyday tote',
      disabled: true
    }
    expect(previewMarkup('text-field', values)).toContain(
      'value="Everyday tote"'
    )
    const snippet = vueSnippet('text-field', values)
    expect(snippet).toContain('<ShTextField v-model="value"')
    expect(snippet).toContain('const value = ref("Everyday tote")')
    expect(snippet).not.toContain('<s-text-field')
  })
  it('escapes HTML and Vue interpolation from property inputs', () => {
    const values = {
      ...initialProps('text-field'),
      label: '"><script>alert(1)</script>{{ secret }}'
    }
    expect(previewMarkup('text-field', values)).not.toContain('<script>')
    expect(vueSnippet('text-field', values)).not.toContain('{{ secret }}')
    expect(vueSnippet('text-field', values)).toContain('&lt;script&gt;')
  })
  it('preserves parent context and produces numeric Vue bindings', () => {
    expect(vueSnippet('table-cell', initialProps('table-cell'))).toContain(
      '<ShTable>'
    )
    const snippet = vueSnippet('progress', {
      ...initialProps('progress'),
      value: '3',
      max: '5'
    })
    expect(snippet).toContain(':max="5"')
    expect(snippet).toContain(':value="3"')
  })
})
