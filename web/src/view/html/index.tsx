export function HtmlContent({ content }: { content: string }) {
	return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
}
