// export async function handleCnvMedia(
//   file: File,
//   uid: string
// ): Promise<string[]> {
//   const srcs: string[] = [];
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d")!;
//   const img = new Image();
//   img.src = URL.createObjectURL(file);
//   img.setAttribute("crossorigin", "anonymous");
//   const width = (canvas.width = 1920);
//   const height = (canvas.height = 1080);
//   const canvasImgBlob = async () => {
//     return await new Promise<Blob>((resolve) => {
//       canvas.toBlob((blob) => resolve(blob!));
//     });
//   };
//   // First corner
//   await wait(500);
//   ctx.drawImage(img, 0, 0, width, height);
//   ctx.clearRect(width / 4, height / 4, (width * 3) / 4, (height * 3) / 4);
//   ctx.clearRect(0, height / 2, (width * 3) / 4, (height * 3) / 4);
//   ctx.clearRect(width / 2, 0, (width * 3) / 4, (height * 3) / 4);
//   srcs.push(await URL.revokeObjectURL);
//   // Second corner
//   ctx.drawImage(img, 0, 0, width, height);
//   ctx.clearRect(0, height / 4, (width * 3) / 4, (height * 3) / 4);
//   ctx.clearRect(0, 0, (width * 2) / 4, (height * 3) / 4);
//   ctx.clearRect((width * 3) / 4, height / 2, width, (height * 3) / 4);
//   srcs.push(
//     await this.setMedia(
//       uid,
//       new File([await canvasImgBlob()], crypto.randomUUID() + ".png"),
//       "vcnv"
//     )
//   );
//   ctx.drawImage(img, 0, 0, width, height);

//   // Third corner
//   ctx.clearRect(0, 0, (width * 3) / 4, (height * 3) / 4);
//   ctx.clearRect(0, (height * 3) / 4, (width * 2) / 4, (height * 3) / 4);
//   ctx.clearRect((width * 3) / 4, 0, width / 4, (height * 1) / 2);
//   srcs.push(
//     await this.setMedia(
//       uid,
//       new File([await canvasImgBlob()], crypto.randomUUID() + ".png"),
//       "vcnv"
//     )
//   );
//   ctx.drawImage(img, 0, 0, width, height);

//   // Fourth corner
//   ctx.clearRect(width / 4, 0, (width * 3) / 4, (height * 3) / 4);
//   ctx.clearRect(0, 0, width / 4, height / 2);
//   ctx.clearRect(width / 2, (height * 3) / 4, width / 2, height / 4);
//   srcs.push(
//     await this.setMedia(
//       uid,
//       new File([await canvasImgBlob()], crypto.randomUUID() + ".png"),
//       "vcnv"
//     )
//   );

//   ctx.drawImage(img, 0, 0, width, height);

//   // Middle piece
//   ctx.clearRect(0, 0, width, height);
//   ctx.beginPath();
//   ctx.rect((width * 1) / 4, (height * 1) / 4, width / 2, height / 2);
//   ctx.clip();
//   ctx.drawImage(img, 0, 0, width, height);
//   srcs.push(
//     await this.setMedia(
//       uid,
//       new File([await canvasImgBlob()], crypto.randomUUID + ".png"),
//       "vcnv"
//     )
//   );

//   return srcs;
// }

// async function wait(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
