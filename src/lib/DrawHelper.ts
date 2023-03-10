import { vec3, mat4, vec4 } from "../common/math/TSM";
import { TypedArrayList } from "../dataStructures/TypedArrayList";
import { EAxisType } from "../common/math/MathHelper";
import { GLMeshBuilder } from "../webgl/WebGLMesh";
export class CoordSystem
{
    public viewport: number[] = []; // 当前坐标系被绘制在哪个视口中
    public axis: vec3; // 当前坐标系绕哪个轴旋转
    public angle: number; // 当前坐标系的旋转的角度(不是弧度！)
    public pos: vec3; // 当前坐标系的位置，如果是多视口渲染的话，就为[0,0,0]
    public isDrawAxis: boolean; // 是否绘制旋转轴
    public isD3D: boolean; // 是否绘制为D3D左手系

    public constructor ( viewport: number[], pos: vec3 = vec3.zero, axis: vec3 = vec3.up, angle: number = 0, isDrawAxis: boolean = false, isD3D: boolean = false )
    {
        this.viewport = viewport;
        this.angle = angle;
        this.axis = axis;
        this.pos = pos;
        this.isDrawAxis = isDrawAxis;
        this.isD3D = isD3D;
    }
}

export class DrawHelper
{
    public static defaultHitCollor: vec4 = new vec4( [ 1, 1, 0 ] );

    public static getCirclePointsOnXYPlane ( pts: TypedArrayList<Float32Array>, radius: number, segment: number = 32 ): void
    {
        pts.clear();
        let step: number = Math.PI / segment;
        let ang: number = 0;
        for ( let i: number = 0; i <= segment; i++ )
        {
            ang = i * step;
            pts.push( Math.cos( ang ) );
            pts.push( Math.sin( ang ) );
            pts.push( 0.0 );
        }
    }

    public static drawFullCoordSystem ( builder: GLMeshBuilder, mat: mat4, len: number = 1, rotateAxis: vec3 | null = null ): void
    {
        builder.gl.lineWidth( 5 ); // 用5个像素大小的直径绘制线段，但目前仅Safari浏览器实现
        builder.gl.disable( builder.gl.DEPTH_TEST ); // 关闭帧缓存深度测试
        builder.begin( builder.gl.LINES );
        // 正x轴
        {
            builder.color( 1.0, 0.0, 0.0 ).vertex( 0.0, 0.0, 0.0 );
            builder.color( 1.0, 0.0, 0.0 ).vertex( len, 0, 0 );
        }
        // 负x轴
        {
            builder.color( 1.0, 0.0, 0.0 ).vertex( 0.0, 0.0, 0.0 );
            builder.color( 1.0, 0.0, 0.0 ).vertex( -len, 0, 0 );
        }
        // 正y轴
        {
            builder.color( 0.0, 1.0, 0.0 ).vertex( 0.0, 0.0, 0.0 );
            builder.color( 0.0, 1.0, 0.0 ).vertex( 0.0, len, 0.0 );
        }
        // 负y轴
        {
            builder.color( 0.0, 1.0, 0.0 ).vertex( 0.0, 0.0, 0.0 );
            builder.color( 0.0, 1.0, 0.0 ).vertex( 0.0, -len, 0.0 );
        }
        // 正z轴
        {
            builder.color( 0.0, 0.0, 1.0 ).vertex( 0.0, 0.0, 0.0 );
            builder.color( 0.0, 0.0, 1.0 ).vertex( 0.0, 0.0, len );

        }
        // 负z轴
        {
            builder.color( 0.0, 0.0, 1.0 ).vertex( 0.0, 0.0, 0.0 );
            builder.color( 0.0, 0.0, 1.0 ).vertex( 0.0, 0.0, -len );
        }

        if ( rotateAxis !== null )
        {
            // 如果要绘制旋转轴，则绘制出来
            let scale: vec3 = rotateAxis.scale( len );
            builder.color( 0.0, 0.0, 0.0 ).vertex( 0, 0, 0 );
            builder.color( 0.0, 0.0, 0.0 ).vertex( scale.x, scale.y, scale.z );
        }
        builder.end( mat ); // 将渲染数据提交给GPU进行渲染
        builder.gl.lineWidth( 1 ); // 恢复线宽为1个像素
        builder.gl.enable( builder.gl.DEPTH_TEST ); // 恢复开始帧缓存深度测试
    }

    public static drawCoordSystem ( builder: GLMeshBuilder, mat: mat4, hitAxis: EAxisType, len: number = 5, rotateAxis: vec3 | null = null, isLeftHandness: boolean = false ): void
    {
        builder.gl.lineWidth( 5 );
        builder.gl.disable( builder.gl.DEPTH_TEST );
        builder.begin( builder.gl.LINES );
        if ( hitAxis === EAxisType.XAXIS )
        {
            builder.color( DrawHelper.defaultHitCollor.r, DrawHelper.defaultHitCollor.g, DrawHelper.defaultHitCollor.b ).vertex( 0.0, 0.0, 0.0 );
            builder.color( DrawHelper.defaultHitCollor.r, DrawHelper.defaultHitCollor.g, DrawHelper.defaultHitCollor.b ).vertex( len, 0, 0 );
        } else
        {
            builder.color( 1.0, 0.0, 0.0 ).vertex( 0.0, 0.0, 0.0 );
            builder.color( 1.0, 0.0, 0.0 ).vertex( len, 0, 0 );
        }

        if ( hitAxis === EAxisType.YAXIS )
        {
            builder.color( DrawHelper.defaultHitCollor.r, DrawHelper.defaultHitCollor.g, DrawHelper.defaultHitCollor.b ).vertex( 0.0, 0.0, 0.0 );
            builder.color( DrawHelper.defaultHitCollor.r, DrawHelper.defaultHitCollor.g, DrawHelper.defaultHitCollor.b ).vertex( 0, len, 0 );
        } else
        {
            builder.color( 0.0, 1.0, 0.0 ).vertex( 0.0, 0.0, 0.0 );
            builder.color( 0.0, 1.0, 0.0 ).vertex( 0.0, len, 0.0 );
        }

        if ( hitAxis === EAxisType.ZAXIS )
        {
            builder.color( DrawHelper.defaultHitCollor.r, DrawHelper.defaultHitCollor.g, DrawHelper.defaultHitCollor.b ).vertex( 0.0, 0.0, 0.0 );
            if ( isLeftHandness === true )
            {
                builder.color( DrawHelper.defaultHitCollor.r, DrawHelper.defaultHitCollor.g, DrawHelper.defaultHitCollor.b ).vertex( 0, 0, -len );
            } else
            {
                builder.color( DrawHelper.defaultHitCollor.r, DrawHelper.defaultHitCollor.g, DrawHelper.defaultHitCollor.b ).vertex( 0, 0, len );
            }
        }
        else
        {
            builder.color( 0.0, 0.0, 1.0 ).vertex( 0.0, 0.0, 0.0 );
            if ( isLeftHandness === true )
            {
                builder.color( 0.0, 0.0, 1.0 ).vertex( 0.0, 0.0, -len );
            } else
            {
                builder.color( 0.0, 0.0, 1.0 ).vertex( 0.0, 0.0, len );
            }
        }

        if ( rotateAxis !== null )
        {
            let scale: vec3 = rotateAxis.scale( len );
            builder.color( 0.0, 0.0, 0 ).vertex( 0, 0, 0 );
            if ( isLeftHandness === true )
            {
                builder.color( 0.0, 0.0, 0.0 ).vertex( scale.x, scale.y, -scale.z );
            } else
            {
                builder.color( 0.0, 0.0, 0.0 ).vertex( scale.x, scale.y, scale.z );
            }
        }

        builder.end( mat );
        builder.gl.lineWidth( 1 );
        builder.gl.enable( builder.gl.DEPTH_TEST );
    }


    /*
        /3--------/7  |
        / |       /   |
        /  |      /   |
        1---------5   |
        |  /2- - -|- -6
        | /       |  /
        |/        | /
        0---------4/
    */
    // 根据mins点（上图中的顶点2，左下后）和maxs（上图中的顶点5，右上前）点的坐标，使用参数指定的颜色绘制线框绑定盒，它是一个立方体
    // GLMeshBuilder的begin / end被调用了三次
    public static drawBoundBox ( builder: GLMeshBuilder, mat: mat4, mins: vec3, maxs: vec3, color: vec4 = vec4.red ): void
    {
        builder.gl.disable( builder.gl.DEPTH_TEST );
        // 使用LINE_LOOP绘制底面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        builder.begin( builder.gl.LINE_LOOP ); // 使用的是LINE_LOOP图元绘制模式
        {
            builder.color( color.r, color.g, color.b ).vertex( mins.x, mins.y, mins.z );  // 2  - - -
            builder.color( color.r, color.g, color.b ).vertex( mins.x, mins.y, maxs.z );  // 0  - - +
            builder.color( color.r, color.g, color.b ).vertex( maxs.x, mins.y, maxs.z );  // 4  + - +
            builder.color( color.r, color.g, color.b ).vertex( maxs.x, mins.y, mins.z );  // 6  + - -
            builder.end( mat );
        }

        // 使用LINE_LOOP绘制顶面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        builder.begin( builder.gl.LINE_LOOP ); // 使用的是LINE_LOOP图元绘制模式
        {
            builder.color( color.r, color.g, color.b ).vertex( mins.x, maxs.y, mins.z );  // 3  - + -
            builder.color( color.r, color.g, color.b ).vertex( maxs.x, maxs.y, mins.z );  // 7  + + -
            builder.color( color.r, color.g, color.b ).vertex( maxs.x, maxs.y, maxs.z );  // 5  + + +
            builder.color( color.r, color.g, color.b ).vertex( mins.x, maxs.y, maxs.z );  // 1  - + +
            builder.end( mat );
        }

        // 使用LINES绘制
        builder.begin( builder.gl.LINES ); // 使用的是LINES图元绘制模式
        {
            builder.color( color.r, color.g, color.b ).vertex( mins.x, mins.y, mins.z );   // 2  - - -
            builder.color( color.r, color.g, color.b ).vertex( mins.x, maxs.y, mins.z );   // 3  - + -

            builder.color( color.r, color.g, color.b ).vertex( mins.x, mins.y, maxs.z );   // 0  - - +
            builder.color( color.r, color.g, color.b ).vertex( mins.x, maxs.y, maxs.z );   // 1  - + +

            builder.color( color.r, color.g, color.b ).vertex( maxs.x, mins.y, maxs.z );   // 4  + - +
            builder.color( color.r, color.g, color.b ).vertex( maxs.x, maxs.y, maxs.z );   // 5  + + +

            builder.color( color.r, color.g, color.b ).vertex( maxs.x, mins.y, mins.z );   // 6  + - -
            builder.color( color.r, color.g, color.b ).vertex( maxs.x, maxs.y, mins.z );   // 7  + + -
            builder.end( mat );
        }
        builder.gl.enable( builder.gl.DEPTH_TEST );
    }

    public static drawWireFrameCubeBox ( builder: GLMeshBuilder, mat: mat4, halfLen: number = 0.2, color: vec4 = vec4.red ): void
    {
        let mins: vec3 = new vec3( [ -halfLen, -halfLen, -halfLen ] );
        let maxs: vec3 = new vec3( [ halfLen, halfLen, halfLen ] );
        DrawHelper.drawBoundBox( builder, mat, mins, maxs, color );
    }


    /*
       /3--------/7  |
       / |       /   |
       /  |      /   |
       1---------5   |
       |  /2- - -|- -6
       | /       |  /
       |/        | /
       0---------4/
   */
    public static drawTextureCubeBox ( builder: GLMeshBuilder, mat: mat4, halfLen: number = 0.2, tc: number[] = [
        0, 0, 1, 0, 1, 1, 0, 1,  // 前面
        0, 0, 1, 0, 1, 1, 0, 1,  // 右面
        0, 0, 1, 0, 1, 1, 0, 1,  // 后面
        0, 0, 1, 0, 1, 1, 0, 1,  // 左面
        0, 0, 1, 0, 1, 1, 0, 1,  // 上面
        0, 0, 1, 0, 1, 1, 0, 1,  // 下面
    ] ): void
    {
        // 前面
        builder.begin( builder.gl.TRIANGLE_FAN );
        builder.texcoord( tc[ 0 ], tc[ 1 ] ).vertex( -halfLen, -halfLen, halfLen );  // 0  - - +
        builder.texcoord( tc[ 2 ], tc[ 3 ] ).vertex( halfLen, -halfLen, halfLen );   // 4  + - +
        builder.texcoord( tc[ 4 ], tc[ 5 ] ).vertex( halfLen, halfLen, halfLen );    // 5  + + +
        builder.texcoord( tc[ 6 ], tc[ 7 ] ).vertex( -halfLen, halfLen, halfLen );   // 1  - + +
        builder.end( mat );
        // 右面
        builder.begin( builder.gl.TRIANGLE_FAN );
        builder.texcoord( tc[ 8 ], tc[ 9 ] ).vertex( halfLen, -halfLen, halfLen );   // 4  + - +
        builder.texcoord( tc[ 10 ], tc[ 11 ] ).vertex( halfLen, -halfLen, -halfLen );  // 6  + - -
        builder.texcoord( tc[ 12 ], tc[ 13 ] ).vertex( halfLen, halfLen, -halfLen );   // 7  + + -
        builder.texcoord( tc[ 14 ], tc[ 15 ] ).vertex( halfLen, halfLen, halfLen );    // 5  + + +
        builder.end( mat );
        // 后面
        builder.begin( builder.gl.TRIANGLE_FAN );
        builder.texcoord( tc[ 16 ], tc[ 17 ] ).vertex( halfLen, -halfLen, -halfLen );  // 6  + - -
        builder.texcoord( tc[ 18 ], tc[ 19 ] ).vertex( -halfLen, -halfLen, -halfLen ); // 2  - - -
        builder.texcoord( tc[ 20 ], tc[ 21 ] ).vertex( -halfLen, halfLen, -halfLen );  // 3  - + -
        builder.texcoord( tc[ 22 ], tc[ 23 ] ).vertex( halfLen, halfLen, -halfLen );   // 7  + + -
        builder.end( mat );
        // 左面
        builder.begin( builder.gl.TRIANGLE_FAN );
        builder.texcoord( tc[ 24 ], tc[ 25 ] ).vertex( -halfLen, -halfLen, -halfLen );  // 2  - - -
        builder.texcoord( tc[ 26 ], tc[ 27 ] ).vertex( -halfLen, -halfLen, halfLen );   // 0  - - +
        builder.texcoord( tc[ 28 ], tc[ 29 ] ).vertex( -halfLen, halfLen, halfLen );    // 1  - + +
        builder.texcoord( tc[ 30 ], tc[ 31 ] ).vertex( -halfLen, halfLen, -halfLen );   // 3  - + -
        builder.end( mat );
        // 上面
        builder.begin( builder.gl.TRIANGLE_FAN );
        builder.texcoord( tc[ 32 ], tc[ 33 ] ).vertex( -halfLen, halfLen, halfLen );    // 1  - + +
        builder.texcoord( tc[ 34 ], tc[ 35 ] ).vertex( halfLen, halfLen, halfLen );     // 5  + + +
        builder.texcoord( tc[ 36 ], tc[ 37 ] ).vertex( halfLen, halfLen, -halfLen );    // 7  + + -
        builder.texcoord( tc[ 38 ], tc[ 39 ] ).vertex( -halfLen, halfLen, -halfLen );   // 3  - + -
        builder.end( mat );
        // 下面
        builder.begin( builder.gl.TRIANGLE_FAN );
        builder.texcoord( tc[ 40 ], tc[ 41 ] ).vertex( -halfLen, -halfLen, halfLen );  // 0  - - +
        builder.texcoord( tc[ 42 ], tc[ 43 ] ).vertex( -halfLen, -halfLen, -halfLen ); // 2  - - -
        builder.texcoord( tc[ 44 ], tc[ 45 ] ).vertex( halfLen, -halfLen, -halfLen );  // 6  + - -
        builder.texcoord( tc[ 46 ], tc[ 47 ] ).vertex( halfLen, -halfLen, halfLen );   // 4  + - +
        builder.end( mat );
    }

    

    // 其中参数pts是Frustum.points返回的包含8个顶点的数组
    public static drawWireFrameFrustum ( builder: GLMeshBuilder, mat: mat4, pts: vec3[], color: vec4 = vec4.red ): void
    {
        builder.gl.disable( builder.gl.DEPTH_TEST );
        // 使用LINE_LOOP绘制近平面的四边形
        builder.begin( builder.gl.LINE_LOOP ); // 使用的是LINE_LOOP图元绘制模式
        {
            builder.color( color.r, color.g, color.b ).vertex( pts[ 0 ].x, pts[ 0 ].y, pts[ 0 ].z );  // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 1 ].x, pts[ 1 ].y, pts[ 1 ].z );  // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 2 ].x, pts[ 2 ].y, pts[ 2 ].z );  // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 3 ].x, pts[ 3 ].y, pts[ 3 ].z );  // 
            builder.end( mat );
        }

        // 使用LINE_LOOP绘制远平面的四边形
        builder.begin( builder.gl.LINE_LOOP ); // 使用的是LINE_LOOP图元绘制模式
        {
            builder.color( color.r, color.g, color.b ).vertex( pts[ 4 ].x, pts[ 4 ].y, pts[ 4 ].z );  // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 5 ].x, pts[ 5 ].y, pts[ 5 ].z );  // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 6 ].x, pts[ 6 ].y, pts[ 6 ].z );  // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 7 ].x, pts[ 7 ].y, pts[ 7 ].z );  // 
            builder.end( mat );
        }

        // 使用LINES绘制绘制近平面与远平面的四条边
        builder.begin( builder.gl.LINES ); // 使用的是LINES图元绘制模式
        {
            builder.color( color.r, color.g, color.b ).vertex( pts[ 0 ].x, pts[ 0 ].y, pts[ 0 ].z );   // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 4 ].x, pts[ 4 ].y, pts[ 4 ].z );   // 

            builder.color( color.r, color.g, color.b ).vertex( pts[ 1 ].x, pts[ 1 ].y, pts[ 1 ].z );   // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 5 ].x, pts[ 5 ].y, pts[ 5 ].z );   // 

            builder.color( color.r, color.g, color.b ).vertex( pts[ 2 ].x, pts[ 2 ].y, pts[ 2 ].z );   // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 6 ].x, pts[ 6 ].y, pts[ 6 ].z );   // 

            builder.color( color.r, color.g, color.b ).vertex( pts[ 3 ].x, pts[ 3 ].y, pts[ 3 ].z );   // 
            builder.color( color.r, color.g, color.b ).vertex( pts[ 7 ].x, pts[ 7 ].y, pts[ 7 ].z );   // 

            builder.end( mat );
        }
        builder.gl.enable( builder.gl.DEPTH_TEST );
    }
}


