// PDF stores items just like ScreenBox, these are in PDF space
export interface MatchSnippetPdfItem extends ScreenBox {
  text?: string;
}

export interface UnderlinedPdfItem extends ScreenBox {
  text?: string;
}

export type IVertex = {
  x: number;
  y: number;
};

export interface ScreenBox extends IVertex {
  width: number;
  height: number;
}
