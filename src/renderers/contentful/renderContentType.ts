import { ContentType, Field, FieldType, Sys } from "contentful"

import renderInterface from "../typescript/renderInterface"
import renderField from "./renderField"
import renderContentTypeId from "./renderContentTypeId"

import renderArray from "./fields/renderArray"
import renderBoolean from "./fields/renderBoolean"
import renderLink from "./fields/renderLink"
import renderLocation from "./fields/renderLocation"
import renderNumber from "./fields/renderNumber"
import renderObject from "./fields/renderObject"
import renderRichText from "./fields/renderRichText"
import renderSymbol from "./fields/renderSymbol"

export default function renderContentType(contentType: ContentType) {
  return renderInterface(
    renderContentTypeId(contentType.sys.id),
    renderContentTypeFields(contentType.fields),
    contentType.description,
    renderSys(contentType.sys),
  )
}

function renderContentTypeFields(fields: Field[]): string {
  return fields
    .filter(field => !field.omitted)
    .map<string>(field => {
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

      return renderField(field, functionMap[field.type](field))
    })
    .join("\n\n")
}

function renderSys(sys: Sys) {
  return `
    sys: {
      id: string;
      type: string;
      createdAt: string;
      updatedAt: string;
      locale: string;
      contentType: {
        sys: {
          id: '${sys.id}';
          linkType: 'ContentType';
          type: 'Link';
        }
      }
    }
  `
}