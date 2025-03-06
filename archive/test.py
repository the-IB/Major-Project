import asyncio

async def fn():
    task = asyncio.create_task(fn2())
    print("one")
    await asyncio.sleep(1)
    print('three')
    await asyncio.sleep(1)
    print('five')
    await asyncio.sleep(1)

async def fn2():
	print("two")
	await asyncio.sleep(1)
	print("four")
 
 
asyncio.run(fn())
