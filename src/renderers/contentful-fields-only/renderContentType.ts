import { ContentType, Field, FieldType } from "contentful"

import {
  getOverridenFields,
  getOverridenFieldType,
  OverridenContentTypes,
  OverridenFields,
} from "../../lib/fieldOverrides"
import renderInterface from "../typescript/renderInterface"
import renderField from "../contentful/renderField"
import renderContentTypeId from "../contentful/renderContentTypeId"

import renderArray from "../contentful-fields-only/fields/renderArray"
import renderLink from "../contentful-fields-only/fields/renderLink"
import renderRichText from "../contentful-fields-only/fields/renderRichText"

import renderBoolean from "../contentful/fields/renderBoolean"
import renderLocation from "../contentful/fields/renderLocation"
import renderNumber from "../contentful/fields/renderNumber"
import renderObject from "../contentful/fields/renderObject"
import renderSymbol from "../contentful/fields/renderSymbol"

export default function renderContentType(
  contentType: ContentType,
  fieldOverrides?: OverridenContentTypes,
): string {
  const name = renderContentTypeId(contentType.sys.id)
  const overridenFields = getOverridenFields(contentType, fieldOverrides)
  const fields = renderContentTypeFields(contentType.fields, overridenFields)

  return renderInterface({
    name,
    fields: `
      fields: { ${fields} };
      [otherKeys: string]: any;
    `,
  })
}

function renderContentTypeFields(fields: Field[], overridenFields?: OverridenFields): string {
  return fields
    .filter(field => !field.omitted)
    .map<string>(field => {
      const overridenType = getOverridenFieldType(field, overridenFields)

      const functionMap: Record<FieldType, (field: Field) => string> = {
        Array: renderArray,
        Boolean: renderBoolean,
        Date: renderSymbol,
        Integer: renderNumber,
        Link: renderLink,
        Location: renderLocation,
        Number: renderNumber,
        Object: renderObject,
        RichText: renderRichText,
        Symbol: renderSymbol,
        Text: renderSymbol,
      }

      return renderField(field, overridenType || functionMap[field.type](field))
    })
    .join("\n\n")
}
